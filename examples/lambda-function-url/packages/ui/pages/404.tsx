// import { FileExclamationOutlined } from '@ant-design/icons'
import { Button, Result } from 'antd'
import { useRouter } from 'next/router'
import React from 'react'

export default function NotFoundPage() {
  const router = useRouter()

  return <Result
    // status='404'
    // icon={<FileExclamationOutlined />}
    icon={null}
    title='Page not found'
    subTitle={'Sorry, the page you were looking for doesn\'t exist.'}
    extra={<Button type='primary' onClick={() => router.push('/')}>Home</Button>}
  />
}