'use client'

import React from 'react'
import { Col, Row } from 'antd'

export default function UserData({ user, minColSpan = 24 }){
  const colSpans = {
    xs: Math.max(minColSpan, 24),
    sm: Math.max(minColSpan, 12),
    xl: Math.max(minColSpan, 8),
  }
  return <Row gutter={[48, 24]}>
    <Col {...colSpans}>
      <div><strong>Email</strong></div>
      <div><a href={`mailto:${user.email}`} target='_blank' rel='noopener'>{user.email}</a></div>
    </Col>
    <Col xs={24}>
      <div><strong>Profile picture</strong></div>
      {user.profilePicture ? <div style={{textAlign: 'center'}}>
        <img src={user.profilePicture} />
      </div> : <em>None</em>}
    </Col>
  </Row>
}
