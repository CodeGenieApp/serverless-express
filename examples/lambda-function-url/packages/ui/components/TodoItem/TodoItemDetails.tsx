'use client'

import React, { useState } from 'react'
import {
  Button,
  Card,
  Skeleton,
  Space,
} from 'antd'
import TodoItemUpsertModal from './TodoItemUpsertModal'
import TodoItemData from './TodoItemData'
import AvatarNameLink from '../AvatarNameLink'

export default function TodoItemDetails({
  listId,
  todoItem,
}) {
  return (
    <Space size='large' direction='vertical' style={{width: '100%'}}>
      <TodoItemDetailsDetails
        listId={listId}
        todoItem={todoItem}
      />
    </Space>
  )
}

function TodoItemDetailsDetails({
  listId,
  todoItem,
}) {
  const [isUpsertModalVisible, setIsUpsertModalVisible] = useState(false)
  if (!todoItem) return <Skeleton />

  function showUpsertModal() {
    setIsUpsertModalVisible(true)
  }

  return (
    <Card
      bordered={false}
      title={(
        <AvatarNameLink
          image={todoItem.image}
          imageAlt='Image'
          name={todoItem.title}
          avatarProps={{size: 'large'}}
        />
      )}
      extra={(
        <Button type='primary' onClick={showUpsertModal}>
          Edit
        </Button>
      )}
    >
      <TodoItemUpsertModal
        isOpen={isUpsertModalVisible}
        setIsOpen={setIsUpsertModalVisible}
        todoItem={todoItem}
        listId={listId}
      />
      <TodoItemData todoItem={todoItem} />
    </Card>
  )
}
