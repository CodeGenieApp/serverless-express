'use client'

import React from 'react'
import { Col, Row } from 'antd'
import { useMeQuery } from './meHooks'

export default function MeData({ minColSpan = 12 }){
  const meQuery = useMeQuery()
  const me = meQuery.data?.data
  const colSpans = {
    xs: Math.max(minColSpan, 24),
    sm: Math.max(minColSpan, 12),
    xl: Math.max(minColSpan, 8),
  }
  return <Row gutter={[48, 24]}>
    <Col {...colSpans}>
      <div><strong>Email</strong></div>
      <div>{me.email}</div>
    </Col>
  </Row>
}
