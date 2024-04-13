import React from 'react'
import { Avatar, Space } from 'antd'
import Link from 'next/link'

interface AvatarNameLinkParams {
  name?: string
  image?: string
  imageAlt?: string
  linkRoute?: string
  avatarProps?: any
}
export default function AvatarNameLink({
  name,
  image,
  imageAlt,
  linkRoute,
  avatarProps,
}: AvatarNameLinkParams) {
  if (!name) return <em>None</em>

  const firstCharacterFirstWord = name
  const words = name.split(' ')
  const firstCharacterLastWord = words.length > 1 ? words[words.length - 1].charAt(0) : ''

  return (
    <div style={{display: 'flex', alignItems: 'center'}}>
      <MaybeLink linkRoute={linkRoute}>
        <Space>
          <Avatar
            size='default'
            src={image}
            alt={imageAlt}
            {...avatarProps}
          >
            {firstCharacterFirstWord.charAt(0).toUpperCase()}{firstCharacterLastWord.charAt(0).toUpperCase()}
          </Avatar>
          {name}
        </Space>
      </MaybeLink>
    </div>
  )
}

function MaybeLink({ linkRoute, children, ...props }) {
  return linkRoute ? <Link href={linkRoute} {...props}>
    {children}
  </Link> : children
}
