'use client'

import React from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Breadcrumb } from 'antd'
import { HomeOutlined, AppstoreOutlined } from '@ant-design/icons'
import UserDetails from '@/components/User/UserDetails'
import { useGetUserQuery } from '@/components/User/userHooks'
import getPageTitle from '@/ui/lib/getPageTitle'
import AuthenticatedPage from '@/ui/components/layouts/AuthenticatedPage'

export default function UserDetailsPage() {
  const router = useRouter()
  const {
    userId,
  } = router.query
  const getUserQuery = useGetUserQuery({ userId })

  const user = getUserQuery.data?.data

  return (
    <AuthenticatedPage>
      <Head>
        <title>{getPageTitle({ pageTitle: user ? `${user.name} | User` : 'User' })}</title>
      </Head>
      <Breadcrumb items={[
        {
          title: <Link href='/' passHref><HomeOutlined /></Link>,
        },
        {
          title: <Link href='/users' passHref>
            <AppstoreOutlined />{' '}Users
          </Link>,
        },
        {
          title: user?.name || user?.userId,
        },
      ]} />
      <div className='detailsContainer'>
        <UserDetails
          user={user}
        />
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
