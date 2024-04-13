'use client'

import axios from 'axios'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  confirmResetPassword,
  confirmSignUp,
  getCurrentUser,
  resetPassword,
  signIn,
  signOut,
  signUp,
} from 'aws-amplify/auth'
import { useRouter } from 'next/router'
import { notification } from 'antd'

const api = {
  getMe: () => axios.get('/me'),
  updateMe: ({ data }) => axios.put('/me', { me: data }),
}

export function useCurrentUserQuery({ redirectOnNotAuth = true } = {}) {
  const router = useRouter()
  const currentUserQuery = useQuery(['currentUser'], async () => {
    try {
      const currentAuthenticatedUser = await getCurrentUser()
      return currentAuthenticatedUser
    } catch (error) {
      if (redirectOnNotAuth) {
        router.push('/')
      }
      return null
    }
  }, {
    retry: false,
  })
  return currentUserQuery
}

export function useSignInMutation() {
  const currentUserQuery = useCurrentUserQuery({ redirectOnNotAuth: false })
  const signInMutation = useMutation(async ({ email, password }: any) => {
    await signIn({ username: email, password })
    await currentUserQuery.refetch()
  },
  {
    onError: (err: Error) => {
      notification.error({
        message: 'Login failed',
        description: err.message,
        placement: 'topRight',
      })
    },
  })

  return signInMutation
}

export function useSignUpMutation() {
  const signInMutation = useSignInMutation()
  const router = useRouter()
  const signUpMutation = useMutation(async ({ name, password, email }: any) => {
    await signUp({
      username: email,
      password,
      options: {
        userAttributes: { email, name },
      },
    })

    if (process.env.NEXT_PUBLIC_AUTO_VERIFY_USERS) {
      await signInMutation.mutateAsync({ email, password })
      router.push('/todo-lists')
      return
    }

    router.push(`/verify?email=${encodeURIComponent(email)}`)
  },
  {
    onError: async (err: Error) => notification.error({
      message: 'Error',
      description: err.message,
      placement: 'topRight',
    }),
  })

  return signUpMutation
}

export function useSignOutMutation({ includeEmailQueryStringParam = false } = {}) {
  const queryClient = useQueryClient()
  const currentUserQuery = useCurrentUserQuery({ redirectOnNotAuth: false })
  const signOutMutation = useMutation(async () => {
    try {
      await signOut({ global: true })
    } catch (error: any) {
      notification.error({
        message: 'Error trying to logout',
        description: error.message,
        placement: 'topRight',
      })
    } finally {
      queryClient.cancelQueries()
      queryClient.clear()
      queryClient.invalidateQueries()
      queryClient.removeQueries()
      window.localStorage.clear()
      const signInRoute = includeEmailQueryStringParam ? `/?${currentUserQuery.data?.username}` : '/'
      global.window.location.href = signInRoute
    }
  })

  return signOutMutation
}

export function useMeQuery({ isAuthenticated = true } = {}) {
  const meQuery = useQuery(['me'], async () => {
    const apiResponse = await api.getMe()
    return apiResponse.data
  }, { retry: false, enabled: isAuthenticated })
  return meQuery
}

export function useUpdateMeMutation() {
  const queryClient = useQueryClient()
  const updateMeMutation = useMutation<any, any, any>(async ({ userId, data }) => {
    try {
      const response = await api.updateMe({ data })

      await Promise.all([
        queryClient.invalidateQueries(['me']),
      ])

      return response
    } catch (error: any) {
      notification.error({
        message: 'Update failed',
        description: error?.response?.data?.message || error?.message || 'Unknown error',
        placement: 'topRight',
      })
    }
  })

  return updateMeMutation
}

export function useForgotPasswordMutation() {
  const router = useRouter()
  const forgotPasswordMutation = useMutation(
    async ({ email }: { email: string }) => {
      await resetPassword({ username: email })
      notification.success({
        message: 'Password reset link sent',
        description: 'Instructions have been sent to your email.',
        placement: 'topRight',
      })
      await router.push(`/reset-password?email=${email}`)
    },
    {
      onError: async (err: Error) => {
        notification.error({
          message: 'Forgot password failed',
          description: err.message,
          placement: 'topRight',
        })
      },
    },
  )

  return forgotPasswordMutation
}

export function useResetPasswordMutation() {
  const signInMutation = useSignInMutation()
  const router = useRouter()
  const resetPasswordMutation = useMutation(async ({ email, code, password }: { email: string, code: string, password: string }) => {
    await confirmResetPassword({
      username: email.trim(),
      confirmationCode: code.trim(),
      newPassword: password.trim(),
    })
    await signInMutation.mutateAsync({ email, password })
    router.push('/')
  },
  {
    onError: async (err: Error) => notification.error({
      message: 'Error resetting password',
      description: err.message,
      placement: 'topRight',
    }),
  })

  return resetPasswordMutation
}

export function useVerifyAccountMutation() {
  const router = useRouter()
  const verifyAccountMutation = useMutation(async ({ email, code }: { email: string, code: string }) => {
    await confirmSignUp({
      username: email.trim(),
      confirmationCode: code.trim(),
    })
    notification.success({
      message: 'Account confirmed! 🙌',
      description: 'You may now sign in.',
      placement: 'topRight',
    }),
    router.push(`/?email=${encodeURIComponent(email)}`)
  },
  {
    onError: async (err: Error) => notification.error({
      message: 'Error confirming account',
      description: err.message,
      placement: 'topRight',
    }),
  })

  return verifyAccountMutation
}
