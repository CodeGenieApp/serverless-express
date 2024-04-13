import React, { useEffect, useRef } from 'react'
import {
  Button,
  Checkbox,
  Form,
  Input,
  InputRef,
} from 'antd'
import Link from 'next/link'
import UnauthenticatedPage from '../components/layouts/UnauthenticatedPage'
import { useSignInMutation } from '../components/Me/meHooks'
import { useRouter } from 'next/router'

export default function LoginPage() {
  const [form] = Form.useForm()
  const passwordInputRef = useRef<InputRef>(null)
  const signInMutation = useSignInMutation()
  const router = useRouter()
  const queryParamEmail = (router.query.email as string) || ''
  const isSigningIn = signInMutation.isLoading

  useEffect(() => {
    if (queryParamEmail) {
      form.setFieldsValue({
        email: queryParamEmail,
      })
      passwordInputRef.current?.focus()
    }
  }, [queryParamEmail])

  return (
    <UnauthenticatedPage pageTitle='Login'>
      <Form
        layout='vertical'
        name='login_form'
        initialValues={{ remember: true }}
        onFinish={signInMutation.mutate}
        form={form}
        disabled={isSigningIn}
      >
        <Form.Item
          label='Email'
          name='email'
          required={false}
          rules={[
            {
              required: true,
              message: 'Email is required.',
              type: 'email',
            },
          ]}
        >
          <Input type='email' />
        </Form.Item>
        <Form.Item
          label='Password'
          name='password'
          required={false}
          rules={[
            {
              required: true,
              message: 'Password is required.',
            },
          ]}
        >
          <Input.Password ref={passwordInputRef} />
        </Form.Item>
        <Form.Item>
          <Form.Item name='remember' valuePropName='checked' noStyle>
            <Checkbox>Remember me</Checkbox>
          </Form.Item>
          <Button
            loading={signInMutation.isLoading}
            style={{ float: 'right' }}
            type='primary'
            htmlType='submit'
          >
            Sign in
          </Button>
        </Form.Item>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Link href='/register'>Register</Link>
          <Link href='/forgot-password'>Forgot your password?</Link>
        </div>
      </Form>
    </UnauthenticatedPage>
  )
}
