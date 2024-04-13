import Head from 'next/head'
import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { Card, Image, Layout } from 'antd'
import { useCurrentUserQuery } from '../../components/Me/meHooks'
import getPageTitle from '../../lib/getPageTitle'
import BuiltWithCodeGenie from '../BuiltWithCodeGenie'

export default function UnauthenticatedPage({
  children,
  pageTitle,
  includeLayout = true,
  includeLogoContentWrapper = true,
}) {
  const router = useRouter()
  const currentUserQuery = useCurrentUserQuery({ redirectOnNotAuth: false })
  useEffect(() => {
    if (currentUserQuery.data) {
      const searchParams = new URLSearchParams(window.location.search)
      const redirect = searchParams.get('redirect') || '/todo-lists'
      router.replace(redirect)
    }
  }, [currentUserQuery.data])

  if (currentUserQuery.isInitialLoading || currentUserQuery.data) return null

  return (
    <>
      <Head>
        <title>{getPageTitle({ pageTitle })}</title>
      </Head>
      {includeLayout ? <Layout>
        <Layout.Content>
          <div style={{flexDirection: 'column'}}>
            <Card className='layout-container'>
              {includeLogoContentWrapper ? (
                <div>
                  <div style={{textAlign: 'center', padding: '1rem'}}>
                    <Image
                      className='logo'
                      src='/logo.png'
                      alt='Logo'
                      preview={false}
                      style={{maxHeight: '100px', maxWidth: '100%'}}
                    />
                  </div>
                  {children}
                </div>
              ) : children}
            </Card>
            <BuiltWithCodeGenie />
          </div>
        </Layout.Content>
      </Layout> : children}
      <style jsx global>
        {`
            body {
              margin: 0;
            }

            .layout-container {
              width: 360px;
            }

            .ant-layout .ant-layout-content {
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              overflow: auto;
            }

            .ant-card .ant-card-body {
              padding-top: 0;
            }
        `}
      </style>
    </>
  )
}
