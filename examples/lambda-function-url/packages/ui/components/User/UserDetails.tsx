'use client'

import React from 'react'
import {
  Card,
  Skeleton,
  Space,
} from 'antd'
import UserData from './UserData'
import AvatarNameLink from '../AvatarNameLink'

export default function UserDetails({
  user,
}) {
  return (
    <Space size='large' direction='vertical' style={{width: '100%'}}>
      <UserDetailsDetails
        user={user}
      />
    </Space>
  )
}

function UserDetailsDetails({
  user,
}) {
  if (!user) return <Skeleton />

  return (
    <Card
      bordered={false}
      title={(
        <AvatarNameLink
          image={user.profilePicture}
          imageAlt='Profile picture'
          name={user.name}
          avatarProps={{size: 'large'}}
        />
      )}
    >
      <UserData user={user} />
    </Card>
  )
}
