'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useListUsersQuery, UserData } from './userHooks'
import AvatarNameLink from '../AvatarNameLink'
import { usePagination } from '../../lib/usePagination'
import { DEFAULT_PAGE_SIZE } from '../../../common/pagination'

export default function UsersTable({
  ...restProps
}) {
  const [selectedForEdit, setSelectedForEdit] = useState<any|null>()
  const [selectedForDelete, setSelectedForDelete] = useState<any|null>()
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [previousPage, setPreviousPage] = useState<any|null>()
  const listUsersQuery = useListUsersQuery({ page: currentPageIndex, lastEvaluatedKey: previousPage?.lastEvaluatedKey })
  const { pages, totalPagedItemsPlusOneIfHasMorePages } = usePagination({
    items: listUsersQuery?.data?.data,
    lastEvaluatedKey: listUsersQuery?.data?.lastEvaluatedKey,
    currentPageIndex,
  })

  const columns: ColumnsType<UserData> = [{
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render(name, user) {
      const { userId } = user
      const linkText = name || userId
      return <AvatarNameLink
        name={linkText}
        image={user.profilePicture}
        imageAlt='Profile picture'
        avatarProps={{
          size: 30,
          style:{ minWidth: 30 },
        }}
        linkRoute={`/users/${userId}`}
      />
    },
  }, {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    render(email) {
      return <a href={`mailto:${email}`} target='_blank' rel='noopener'>{email}</a>
    },
  }]

  function onPaginate(pageNumber) {
    const pageNumberIndex = pageNumber - 1
    setPreviousPage(pages[pageNumberIndex - 1])
    setCurrentPageIndex(pageNumberIndex)
  }

  return (
    <>
      <Table
        loading={listUsersQuery.isLoading}
        dataSource={listUsersQuery.data?.data}
        rowKey='userId'
        size='small'
        columns={columns}
        pagination={{
          position: ['bottomRight'],
          pageSize: DEFAULT_PAGE_SIZE,
          onChange: onPaginate, total: totalPagedItemsPlusOneIfHasMorePages,
        }}
        // scroll={{ x: 400 }}
        {...restProps}
      />
      <style jsx global>{`
        .ant-table-wrapper .ant-table.ant-table-small .ant-table-tbody .ant-table-wrapper:only-child .ant-table { margin: 0;}
      `}</style>
    </>
  )
}
