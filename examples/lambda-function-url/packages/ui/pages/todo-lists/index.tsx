'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { Breadcrumb, Button } from 'antd'
import { HomeOutlined, AppstoreOutlined } from '@ant-design/icons'
import TodoListsTable from '@/components/TodoList/TodoListsTable'
import TodoListUpsertModal from '@/components/TodoList/TodoListUpsertModal'
import getPageTitle from '@/ui/lib/getPageTitle'
import AuthenticatedPage from '@/ui/components/layouts/AuthenticatedPage'

export default function TodoListsMasterPage() {
  const [isUpsertModalVisible, setIsUpsertModalVisible] = useState(false)

  function showUpsertModal() {
    setIsUpsertModalVisible(true)
  }

  return (
    <AuthenticatedPage>
      <Head>
        <title>{getPageTitle({ pageTitle: 'Todo lists' })}</title>
      </Head>
      <Breadcrumb items={[
        {
          title: <Link href='/' passHref><HomeOutlined /></Link>,
        },
        {
          title: <>
            <AppstoreOutlined />
            <span>Todo lists</span>
          </>,
        },
      ]} />
      <div className='toolbar'>
        <Button type='primary' onClick={showUpsertModal}>
          Create Todo list
        </Button>
      </div>
      <TodoListUpsertModal
        isOpen={isUpsertModalVisible}
        setIsOpen={setIsUpsertModalVisible}
      />
      <TodoListsTable />
      <style jsx>
        {`
        .toolbar {
          margin-bottom: 1rem;
        }
        `}
      </style>
    </AuthenticatedPage>
  )
}
