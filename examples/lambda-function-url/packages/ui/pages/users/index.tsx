'use client'

import React from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { Breadcrumb } from 'antd'
import { HomeOutlined, AppstoreOutlined } from '@ant-design/icons'
import UsersTable from '@/components/User/UsersTable'
import getPageTitle from '@/ui/lib/getPageTitle'
import AuthenticatedPage from '@/ui/components/layouts/AuthenticatedPage'

export default function UsersMasterPage() {
  return (
    <AuthenticatedPage>
      <Head>
        <title>{getPageTitle({ pageTitle: 'Users' })}</title>
      </Head>
      <Breadcrumb items={[
        {
          title: <Link href='/' passHref><HomeOutlined /></Link>,
        },
        {
          title: <>
            <AppstoreOutlined />
            <span>Users</span>
          </>,
        },
      ]} />
      <UsersTable />
    </AuthenticatedPage>
  )
}
