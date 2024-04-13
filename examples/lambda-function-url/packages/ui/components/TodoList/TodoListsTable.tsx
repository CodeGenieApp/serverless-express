'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button, Space, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { useListTodoListsQuery, TodoListData } from './todoListHooks'
import TodoListUpsertModal from './TodoListUpsertModal'
import TodoListDeleteModal from './TodoListDeleteModal'
import AvatarNameLink from '../AvatarNameLink'
import { usePagination } from '../../lib/usePagination'
import { DEFAULT_PAGE_SIZE } from '../../../common/pagination'

export default function TodoListsTable({
  ...restProps
}) {
  const [selectedForEdit, setSelectedForEdit] = useState<any|null>()
  const [selectedForDelete, setSelectedForDelete] = useState<any|null>()
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [previousPage, setPreviousPage] = useState<any|null>()
  const listTodoListsQuery = useListTodoListsQuery({ page: currentPageIndex, lastEvaluatedKey: previousPage?.lastEvaluatedKey })
  const { pages, totalPagedItemsPlusOneIfHasMorePages } = usePagination({
    items: listTodoListsQuery?.data?.data,
    lastEvaluatedKey: listTodoListsQuery?.data?.lastEvaluatedKey,
    currentPageIndex,
  })

  const columns: ColumnsType<TodoListData> = [{
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render(name, todoList) {
      const { listId } = todoList
      const linkText = name || listId
      return <Link href={`/todo-lists/${listId}`}>{linkText}</Link>
    },
  }, {
    title: '',
    key: 'actionButtons',
    align: 'right',
    width: 100,
    render(text, todoList) {
      return (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => setSelectedForEdit(todoList)}
          />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => setSelectedForDelete(todoList)}
            danger
          />
        </Space>
      )
    },
  }]

  function onPaginate(pageNumber) {
    const pageNumberIndex = pageNumber - 1
    setPreviousPage(pages[pageNumberIndex - 1])
    setCurrentPageIndex(pageNumberIndex)
  }

  return (
    <>
      <TodoListUpsertModal
        isOpen={Boolean(selectedForEdit)}
        setIsOpen={() => setSelectedForEdit(null)}
        todoList={selectedForEdit}
      />
      <TodoListDeleteModal
        onDelete={() => setSelectedForDelete(null)}
        onCancel={() => setSelectedForDelete(null)}
        todoList={selectedForDelete}
      />
      <Table
        loading={listTodoListsQuery.isLoading}
        dataSource={listTodoListsQuery.data?.data}
        rowKey='listId'
        size='small'
        columns={columns}
        pagination={{
          position: ['bottomRight'],
          pageSize: DEFAULT_PAGE_SIZE,
          onChange: onPaginate, total: totalPagedItemsPlusOneIfHasMorePages,
        }}
        // scroll={{ x: 200 }}
        {...restProps}
      />
      <style jsx global>{`
        .ant-table-wrapper .ant-table.ant-table-small .ant-table-tbody .ant-table-wrapper:only-child .ant-table { margin: 0;}
      `}</style>
    </>
  )
}
