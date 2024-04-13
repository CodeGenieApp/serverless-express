'use client'

import React from 'react'
import { Modal } from 'antd'
import { useDeleteTodoListMutation } from './todoListHooks'

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

export default function TodoListDeleteModal({ todoList, onCancel, onDelete }) {
  const deleteMutation = useDeleteTodoListMutation()

  async function onDeleteButtonClick() {
    const listId = todoList.listId
    await deleteMutation.mutateAsync({ listId })
    onDelete()
  }

  return (
    <DeleteModal
      isOpen={todoList}
      entityName='TodoList'
      name={todoList?.name}
      isLoading={deleteMutation.isLoading}
      onDeleteButtonClick={onDeleteButtonClick}
      onCancel={onCancel}
    />
  )
}
