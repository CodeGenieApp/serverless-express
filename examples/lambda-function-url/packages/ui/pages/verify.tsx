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
import { useVerifyAccountMutation } from '../components/Me/meHooks'

const { Title } = Typography

export default function VerifyPage() {
  const [form] = Form.useForm()
  const router = useRouter()
  const verifyAccountMutation = useVerifyAccountMutation()
  const queryParamEmail = (router.query.email as string) || ''
  const queryParamCode = (router.query.code as string) || ''

  useEffect(() => {
    if (queryParamEmail && queryParamCode) {
      verifyAccountMutation.mutate({ email: queryParamEmail, code: queryParamCode })
    }
    form.setFieldsValue({
      email: queryParamEmail,
      code: queryParamCode,
    })
  }, [queryParamEmail, queryParamCode])

  return (
    <UnauthenticatedPage pageTitle='Verify Account'>
      <Title level={3}>Verify your account</Title>
      {queryParamCode ? null : <p>Check your inbox for a verification email that includes a verification code, and enter it here. Alternatively, simply click the link in the email.</p>}
      <Form
        layout='vertical'
        name='verifyAccountForm'
        form={form}
        onFinish={verifyAccountMutation.mutate}
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
          label='Verification Code'
          name='code'
          required={false}
          rules={[
            {
              required: true,
              message: 'Code is required.',
              max: 6,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item style={{ margin: '0' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button style={{ marginRight: '1rem' }}>
              <Link href='/'>Back to login</Link>
            </Button>
            <Button
              type='primary'
              disabled={verifyAccountMutation.isLoading}
              loading={verifyAccountMutation.isLoading}
              htmlType='submit'
              className='verify-account-form-button'
            >
              Verify Account
            </Button>
          </div>
        </Form.Item>
      </Form>
    </UnauthenticatedPage>
  )
}
