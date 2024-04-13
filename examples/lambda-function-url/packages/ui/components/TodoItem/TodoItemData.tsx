'use client'

import React from 'react'
import { Col, Row } from 'antd'
import Link from 'next/link'

export default function TodoItemData({ todoItem, minColSpan = 12 }){
  const colSpans = {
    xs: Math.max(minColSpan, 24),
    sm: Math.max(minColSpan, 12),
    xl: Math.max(minColSpan, 8),
  }
  return <Row gutter={[48, 24]}>
    <Col {...colSpans}>
      <div><strong>Completed</strong></div>
      <div>{todoItem.completed ? 'Yes' : 'No'}</div>
    </Col>
    <Col {...colSpans}>
      <div><strong>Due date</strong></div>
      <div>{todoItem.dueDate}</div>
    </Col>
    <Col xs={24}>
      <div><strong>Description</strong></div>
      <div style={{whiteSpace: 'pre-line'}}>{todoItem.description}</div>
    </Col>
    <Col xs={24}>
      <div><strong>Image</strong></div>
      {todoItem.image ? <div style={{textAlign: 'center'}}>
        <img src={todoItem.image} />
      </div> : <em>None</em>}
    </Col>
  </Row>
}
