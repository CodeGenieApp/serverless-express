import React, { useContext, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import baseTheme from '../../themes/base'
import { ThemeContext } from '../../themes/theme-provider'
import {
  Image,
  Layout,
  Divider,
} from 'antd'
import SideMenu from './SideMenu'
import getRedirectToLoginPageUrl from '../../lib/getRedirectRoute'
import { useCurrentUserQuery } from '../Me/meHooks'

const BASE_FONT_SIZE = baseTheme.token.fontSize

export default function AuthenticatedPage({ children }) {
  const { theme } = useContext<any>(ThemeContext)
  useUnauthenticatedRedirect()

  return (<>
    <Layout className='topLayout' hasSider>
      <Layout.Sider className='sider' breakpoint='md' collapsedWidth={0} theme={theme}>
        <div style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
          <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
            <Link href='/' passHref style={{display: 'block', textAlign: 'center'}}>
              <Logo />
            </Link>
            <Divider style={{margin: '2px 0'}} />
            <SideMenu />
          </div>
        </div>
      </Layout.Sider>
      <Layout className='siteLayout'>
        <Layout.Content className='mainContent'>
          {children}
        </Layout.Content>
      </Layout>
    </Layout>
    <style jsx global>
      {`
        body {
          margin: 0;
        }

        .topLayout {
          min-height: 100vh;
        }

        .ant-layout .ant-layout-sider-children {
          height: 100vh;
          overflow-y: auto;
        }

        .ant-layout .ant-layout-sider-zero-width-trigger {
          top: 0;
        }

        .siteLayout {
          height: 100vh;
          overflow: auto;
        }

        .ant-layout-content.mainContent {
          padding: 8px;
          max-width: 1400px;
          width: 100%;
          margin: auto;
          display: flex;
          flex-direction: column;
          padding-bottom: ${BASE_FONT_SIZE}px;
          min-height: auto;
        }

        .ant-breadcrumb {
          margin-bottom: ${BASE_FONT_SIZE}px;
        }
        `}
    </style>
  </>
  )
}

const Logo = () => (
  <>
    <Image
      className='logo'
      src='/logo.png'
      alt='logo'
      preview={false}
    />
    <style jsx global>
      {`
        a {
          display: inline-block;
        }
        .logo {
          padding: 8px;
          max-width: 100%;
          max-height: 50px;
        }
      `}
    </style>
  </>
)

function useUnauthenticatedRedirect() {
  const router = useRouter()
  const currentUserQuery = useCurrentUserQuery({ redirectOnNotAuth: false })
  useEffect(() => {
    if (currentUserQuery.isInitialLoading) return

    if (!currentUserQuery.data) {
      const redirectRoute = getRedirectToLoginPageUrl()
      router.replace(redirectRoute)
    }
  }, [currentUserQuery.isInitialLoading, currentUserQuery.data])
}