'use client'

import React from 'react'
import { Tooltip } from 'antd'
import dayjs from 'dayjs'
import dayjsRelative from 'dayjs/plugin/relativeTime'

// eslint-disable-next-line import/no-named-as-default-member
dayjs.extend(dayjsRelative)

export default function RelativeDateWithAbsoluteHover({date}) {
  return <Tooltip title={dayjs(date).format('D MMM \'YY')}>{dayjs(date).fromNow()}</Tooltip>
}