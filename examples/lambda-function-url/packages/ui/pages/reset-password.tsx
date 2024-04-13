import React, { useEffect } from 'react'
import {
  Button,
  Typography,
  Form,
  Input,
} from 'antd'
import { useRouter } from 'next/router'
import Link from 'next/link'
import UnauthenticatedPage from '../components/layouts/UnauthenticatedPage'
import { useResetPasswordMutation } from '../components/Me/meHooks'

const { Title } = Typography

export default function RestPassword() {
  const [form] = Form.useForm()
  const router = useRouter()
  const queryParamEmail = (router.query.email as string) || ''
  useEffect(() => {
    form.setFieldsValue({
      email: queryParamEmail,
    })
  }, [queryParamEmail])
  const resetPasswordMutation = useResetPasswordMutation()

  return (
    <UnauthenticatedPage pageTitle='Reset Password'>
      <Title level={3}>Reset your password</Title>
      <Form
        layout='vertical'
        name='reset_password_form'
        form={form}
        onFinish={resetPasswordMutation.mutate}
      >
        <Form.Item
          label='Email'
          name='email'
          required={false}
          rules={[
            {
              required: true,
              message: 'Please enter your email.',
              type: 'email',
            },
          ]}
        >
          <Input type='email' />
        </Form.Item>
        <Form.Item
          label='Reset code'
          name='code'
          required={false}
          rules={[
            {
              required: true,
              message: 'Please enter your reset code.',
              max: 6,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          style={{ marginBottom: '10px' }}
          label='New Password'
          name='password'
          required={false}
          rules={[
            {
              required: true,
              message: 'Please enter your password.',
            },
          ]}
        >
          <Input.Password autoComplete='new-password' />
        </Form.Item>
        <Form.Item style={{ margin: '0' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button style={{ marginRight: '1rem' }}>
              <Link href='/'>Back to login</Link>
            </Button>
            <Button
              type='primary'
              disabled={resetPasswordMutation.isLoading}
              loading={resetPasswordMutation.isLoading}
              htmlType='submit'
              className='forgot-password-form-button'
            >
              Reset Password
            </Button>
          </div>
        </Form.Item>
      </Form>
    </UnauthenticatedPage>
  )
}
