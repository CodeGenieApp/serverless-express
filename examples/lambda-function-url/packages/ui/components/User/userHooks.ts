'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notification } from 'antd'
import axios from 'axios'
import type { Filter } from '@/common/filter'

interface ListUsersParams {
  lastEvaluatedKey?: string
  filter?: Filter
}

const api = {
  listUsers: ({ lastEvaluatedKey, filter }: ListUsersParams = {}) => axios.get('/users', {
    params: {
      lastEvaluatedKey,
      filter,
    },
  }),
  getUser: ({ userId }) => axios.get(`/users/${userId}`),
  createUser: ({ data }) => axios.post('/users', { user: data }),
  updateUser: ({ userId, data }) => axios.put(`/users/${userId}`, { user: data }),
  deleteUser: ({ userId }) => axios.delete(`/users/${userId}`),
}

interface UseListUsersQueryParams {
  page?: number
  lastEvaluatedKey?: string
}

interface ListUsersApiResponse {
  data: UserData[]
  lastEvaluatedKey: string
}

export interface UserData {
  [k: string]: any
}

export function useListUsersQuery({ page, lastEvaluatedKey }: UseListUsersQueryParams) {
  const listUsersQuery = useQuery<ListUsersApiResponse>(['users', page], async () => {
    const apiResponse = await api.listUsers({ lastEvaluatedKey })
    return apiResponse.data
  }, {
    keepPreviousData: true,
  })

  return listUsersQuery
}

interface UseSearchUsersQueryParams {
  name?: string
  lastEvaluatedKey?: string
}

export function useSearchUsersQuery({ name, lastEvaluatedKey }: UseSearchUsersQueryParams) {
  const searchUsersQuery = useQuery(['searchUsers', name, lastEvaluatedKey], async () => {
    const filter = name ? {
      filters: [{
        property: 'name',
        value: name,
      }],
    } : undefined
    const apiResponse = await api.listUsers({ lastEvaluatedKey, filter })
    return apiResponse.data
  },
  {
    keepPreviousData: true,
    staleTime: 30000, // 30s
  })

  return searchUsersQuery
}

export function useGetUserQuery({ userId }) {
  const getUserQuery = useQuery(['users', userId], async () => {
    const apiResponse = await api.getUser({ userId })
    return apiResponse.data
  }, {
    enabled: Boolean(userId),
  })

  return getUserQuery
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient()
  const createUserMutation = useMutation<any, any, any>(async ({ data }) => {
    try {
      const response = await api.createUser({ data })

      await queryClient.invalidateQueries(['users'])
      return response
    } catch (error: any) {
      notification.error({
        message: 'Create failed',
        description: error?.response?.data?.message || error?.message || 'Unknown error',
        placement: 'topRight',
      })
    }
  })

  return createUserMutation
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient()
  const updateUserMutation = useMutation<any, any, any>(async ({ userId, data }) => {
    try {
      const response = await api.updateUser({ userId, data })

      await Promise.all([
        queryClient.invalidateQueries(['users']),
        queryClient.invalidateQueries(['users', userId]),
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

  return updateUserMutation
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient()
  const deleteUserMutation = useMutation<any, any, any>(async ({ userId }) => {
    try {
      const response = await api.deleteUser({ userId })

      await Promise.all([
        queryClient.invalidateQueries(['users']),
        queryClient.invalidateQueries(['users', userId]),
      ])

      return response
    } catch (error: any) {
      notification.error({
        message: 'Delete failed',
        description: error?.response?.data?.message || error?.message || 'Unknown error',
        placement: 'topRight',
      })
    }
  })

  return deleteUserMutation
}
