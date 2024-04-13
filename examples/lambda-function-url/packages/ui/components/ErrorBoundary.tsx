import React, { Component, ReactNode } from 'react'
import { Button, Result } from 'antd'

interface ErrorBoundaryProps {
  children: ReactNode
}
interface ErrorBoundaryState {
  hasError: boolean
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props) {
    super(props)
 
    this.state = { hasError: false }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true }
  }
  componentDidCatch(error, errorInfo) {
    console.error({ error, errorInfo })
  }
  render() {
    if (this.state.hasError) {
      return (<Result
        status='error'
        title='Sorry! We encountered an error.'
        subTitle='Contact support if the error persists.'
        extra={[
          <Button type='primary' key='reload' onClick={() => window.location.href = '/'}>
            Reload
          </Button>,
        ]}
      >
      </Result>)
    }
 
    return this.props.children
  }
}