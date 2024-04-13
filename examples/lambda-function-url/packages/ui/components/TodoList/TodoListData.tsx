'use client'

import React from 'react'
import { Col, Row } from 'antd'

export default function TodoListData({ todoList, minColSpan = Infinity }){
  const colSpans = {
    xs: Math.max(minColSpan, 24),
    sm: Math.max(minColSpan, 12),
    xl: Math.max(minColSpan, 8),
  }
  return <Row gutter={[48, 24]}>
  </Row>
}
