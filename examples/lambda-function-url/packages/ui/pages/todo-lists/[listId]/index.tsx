'use client'

import React from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Breadcrumb } from 'antd'
import { HomeOutlined, AppstoreOutlined } from '@ant-design/icons'
import TodoListDetails from '@/components/TodoList/TodoListDetails'
import { useGetTodoListQuery } from '@/components/TodoList/todoListHooks'
import getPageTitle from '@/ui/lib/getPageTitle'
import AuthenticatedPage from '@/ui/components/layouts/AuthenticatedPage'

export default function TodoListDetailsPage() {
  const router = useRouter()
  const {
    listId,
  } = router.query
  const getTodoListQuery = useGetTodoListQuery({ listId })

  const todoList = getTodoListQuery.data?.data

  return (
    <AuthenticatedPage>
      <Head>
        <title>{getPageTitle({ pageTitle: todoList ? `${todoList.name} | Todo list` : 'Todo list' })}</title>
      </Head>
      <Breadcrumb items={[
        {
          title: <Link href='/' passHref><HomeOutlined /></Link>,
        },
        {
          title: <Link href='/todo-lists' passHref>
            <AppstoreOutlined />{' '}Todo lists
          </Link>,
        },
        {
          title: todoList?.name || todoList?.listId,
        },
      ]} />
      <div className='detailsContainer'>
        <TodoListDetails
          todoList={todoList}
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
