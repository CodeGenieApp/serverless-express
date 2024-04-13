'use client'

import React from 'react'
import { Modal } from 'antd'
import { useDeleteUserMutation } from './userHooks'

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

export default function UserDeleteModal({ user, onCancel, onDelete }) {
  const deleteMutation = useDeleteUserMutation()

  async function onDeleteButtonClick() {
    const userId = user.userId
    await deleteMutation.mutateAsync({ userId })
    onDelete()
  }

  return (
    <DeleteModal
      isOpen={user}
      entityName='User'
      name={user?.name}
      isLoading={deleteMutation.isLoading}
      onDeleteButtonClick={onDeleteButtonClick}
      onCancel={onCancel}
    />
  )
}
