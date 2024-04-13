'use client'

import React from 'react'
import { Modal } from 'antd'
import { useDeleteTodoItemMutation } from './todoItemHooks'

function DeleteModal({
  isOpen,
  entityName,
  name,
  isLoading,
  onDeleteButtonClick,
  onCancel,
}) {
  return (
    <Modal
      title={`Delete ${name}`}
      open={Boolean(isOpen)}
      okText={`Delete ${name}`}
      onOk={onDeleteButtonClick}
      onCancel={onCancel}
      okButtonProps={{
        loading: isLoading,
        danger: true,
      }}
    >
      Are you sure you want to delete the
      {' '}
      <strong>{entityName}</strong>
      :
      {' '}
      <strong>{name}</strong>
      ?
    </Modal>
  )
}

export default function TodoItemDeleteModal({ todoItem, onCancel, onDelete }) {
  const deleteMutation = useDeleteTodoItemMutation()

  async function onDeleteButtonClick() {
    const listId = todoItem.listId
    await deleteMutation.mutateAsync({ listId, itemId: todoItem.itemId })
    onDelete()
  }

  return (
    <DeleteModal
      isOpen={todoItem}
      entityName='TodoItem'
      name={todoItem?.title}
      isLoading={deleteMutation.isLoading}
      onDeleteButtonClick={onDeleteButtonClick}
      onCancel={onCancel}
    />
  )
}
