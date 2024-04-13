'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button, Space, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { useListTodoItemsQuery, TodoItemData } from './todoItemHooks'
import TodoItemUpsertModal from './TodoItemUpsertModal'
import TodoItemDeleteModal from './TodoItemDeleteModal'
import AvatarNameLink from '../AvatarNameLink'
import { usePagination } from '../../lib/usePagination'
import { DEFAULT_PAGE_SIZE } from '../../../common/pagination'

export default function TodoItemsTable({
  listId,
  ...restProps
}) {
  const [selectedForEdit, setSelectedForEdit] = useState<any|null>()
  const [selectedForDelete, setSelectedForDelete] = useState<any|null>()
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [previousPage, setPreviousPage] = useState<any|null>()
  const listTodoItemsQuery = useListTodoItemsQuery({ page: currentPageIndex, lastEvaluatedKey: previousPage?.lastEvaluatedKey, listId })
  const { pages, totalPagedItemsPlusOneIfHasMorePages } = usePagination({
    items: listTodoItemsQuery?.data?.data,
    lastEvaluatedKey: listTodoItemsQuery?.data?.lastEvaluatedKey,
    currentPageIndex,
  })

  const columns: ColumnsType<TodoItemData> = [{
    title: 'Title',
    dataIndex: 'title',
    key: 'title',
    render(title, todoItem) {
      const { itemId } = todoItem
      const text = title || itemId
      return <AvatarNameLink
        name={text}
        image={todoItem.image}
        imageAlt='Image'
        avatarProps={{
          size: 30,
          style:{ minWidth: 30 },
        }}
      />
    },
  }, {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
  }, {
    title: 'Completed',
    dataIndex: 'completed',
    key: 'completed',
    render(completed) {
      return completed ? 'Yes' : 'No'
    },
  }, {
    title: 'Due date',
    dataIndex: 'dueDate',
    key: 'dueDate',
  }, {
    title: '',
    key: 'actionButtons',
    align: 'right',
    width: 100,
    render(text, todoItem) {
      return (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => setSelectedForEdit(todoItem)}
          />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => setSelectedForDelete(todoItem)}
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
      <TodoItemUpsertModal
        isOpen={Boolean(selectedForEdit)}
        setIsOpen={() => setSelectedForEdit(null)}
        todoItem={selectedForEdit}
        listId={listId}
      />
      <TodoItemDeleteModal
        onDelete={() => setSelectedForDelete(null)}
        onCancel={() => setSelectedForDelete(null)}
        todoItem={selectedForDelete}
      />
      <Table
        loading={listTodoItemsQuery.isLoading}
        dataSource={listTodoItemsQuery.data?.data}
        rowKey='itemId'
        size='small'
        columns={columns}
        pagination={{
          position: ['bottomRight'],
          pageSize: DEFAULT_PAGE_SIZE,
          onChange: onPaginate, total: totalPagedItemsPlusOneIfHasMorePages,
        }}
        // scroll={{ x: 800 }}
        {...restProps}
      />
      <style jsx global>{`
        .ant-table-wrapper .ant-table.ant-table-small .ant-table-tbody .ant-table-wrapper:only-child .ant-table { margin: 0;}
      `}</style>
    </>
  )
}
