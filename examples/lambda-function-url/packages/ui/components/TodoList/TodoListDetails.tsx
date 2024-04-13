'use client'

import React, { useState } from 'react'
import {
  Button,
  Card,
  Skeleton,
  Space,
} from 'antd'
import TodoListUpsertModal from './TodoListUpsertModal'
import TodoListData from './TodoListData'
import TodoItemsTable from '../TodoItem/TodoItemsTable'
import TodoItemUpsertModal from '../TodoItem/TodoItemUpsertModal'

export default function TodoListDetails({
  todoList,
}) {
  return (
    <Space size='large' direction='vertical' style={{width: '100%'}}>
      <TodoListDetailsDetails
        todoList={todoList}
      />
      <TodoItems
        todoList={todoList}
      />
    </Space>
  )
}

function TodoListDetailsDetails({
  todoList,
}) {
  const [isUpsertModalVisible, setIsUpsertModalVisible] = useState(false)
  if (!todoList) return <Skeleton />

  function showUpsertModal() {
    setIsUpsertModalVisible(true)
  }

  return (
    <Card
      bordered={false}
      title={todoList.name}
      extra={(
        <Button type='primary' onClick={showUpsertModal}>
          Edit
        </Button>
      )}
    >
      <TodoListUpsertModal
        isOpen={isUpsertModalVisible}
        setIsOpen={setIsUpsertModalVisible}
        todoList={todoList}
      />
      <TodoListData todoList={todoList} />
    </Card>
  )
}

export function TodoItems({
  todoList,
}) {
  const [isUpsertModalVisible, setIsUpsertModalVisible] = useState(false)

  if (!todoList) return <Skeleton />

  function showUpsertModal() {
    setIsUpsertModalVisible(true)
  }

  return (
    <Card
      bordered={false}
      title='Todo items'
      extra={(
        <Button type='primary' onClick={showUpsertModal}>
          Create Todo item
        </Button>
      )}
      className='cardWithTableBody'
    >
      <TodoItemUpsertModal
        isOpen={isUpsertModalVisible}
        setIsOpen={setIsUpsertModalVisible}
        listId={todoList.listId}
      />
      <TodoItemsTable
        listId={todoList.listId}
      />
      <style jsx global>{`
        .cardWithTableBody .ant-card-body {
          padding: 0;
          overflow: auto;
        }
      `}</style>
    </Card>
  )
}
