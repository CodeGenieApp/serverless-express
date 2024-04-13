'use client'

import React, { useState } from 'react'
import { Button, Card, Skeleton, Space } from 'antd'
import { LogoutOutlined } from '@ant-design/icons'
import MeUpsertModal from './MeUpsertModal'
import MeData from './MeData'
import AvatarNameLink from '../AvatarNameLink'
import { useMeQuery, useSignOutMutation } from './meHooks'

export default function MeDetails() {
  return (
    <Space size='large' direction='vertical' style={{ width: '100%' }}>
      <MeDetailsDetails />
    </Space>
  )
}

function MeDetailsDetails() {
  const meQuery = useMeQuery()
  const signOutMutation = useSignOutMutation()
  const me = meQuery.data?.data
  const [isUpsertModalVisible, setIsUpsertModalVisible] = useState(false)

  if (!me) return <Skeleton />

  function showUpsertModal() {
    setIsUpsertModalVisible(true)
  }

  return (
    <Card
      bordered={false}
      title={<AvatarNameLink image={me.profilePicture} imageAlt='Profile Picture' name={me.name} avatarProps={{ size: 'large' }} />}
      extra={
        <Space>
          <Button type='primary' onClick={showUpsertModal}>
            Edit
          </Button>
          <Button icon={<LogoutOutlined />} onClick={() => signOutMutation.mutateAsync()} loading={signOutMutation.isLoading}>
            Logout
          </Button>
        </Space>
      }
    >
      <MeUpsertModal isOpen={isUpsertModalVisible} setIsOpen={setIsUpsertModalVisible} />
      <MeData />
    </Card>
  )
}
