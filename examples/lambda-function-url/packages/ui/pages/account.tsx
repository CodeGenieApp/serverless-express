'use client'

import React from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { Breadcrumb } from 'antd'
import { HomeOutlined, AppstoreOutlined } from '@ant-design/icons'
import { useMeQuery } from '../components/Me/meHooks'
import MeDetails from '../components/Me/MeDetails'
import AuthenticatedPage from '../components/layouts/AuthenticatedPage'

export default function AccountPage() {
  const meQuery = useMeQuery()
  const me = meQuery.data?.data

  return (
    <AuthenticatedPage>
      <Head>
        <title>Account</title>
      </Head>
      <Breadcrumb items={[
        {
          title: <Link href='/' passHref><HomeOutlined /></Link>,
        },
        {
          title: 'Account',
        },
      ]} />
      <div className='detailsContainer'>
        <MeDetails />
      </div>
      <style jsx>
        {`
        .detailsContainer {
          margin-top: 1rem;
        }
        `}
      </style>
    </AuthenticatedPage>
  )
}
