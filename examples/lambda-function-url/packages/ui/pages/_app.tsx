'use client'
/// <reference types="styled-jsx" />
// NOTE: ^ prevents typescript from complaining about `jsx global` on <style jsx global> in various files
import React, { useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Amplify } from 'aws-amplify'
import { fetchAuthSession } from 'aws-amplify/auth'
import { ConfigProvider } from 'antd'
import axios from 'axios'
import '../themes/global.css'
import { ThemeContext } from '../themes/theme-provider'
import { THEMES, getInitialTheme } from '../themes/themes'
import Head from 'next/head'
import getRedirectToLoginPageUrl from '../lib/getRedirectRoute'
import ErrorBoundary from '../components/ErrorBoundary'

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_CognitoUserPoolId!,
      userPoolClientId: process.env.NEXT_PUBLIC_CognitoUserPoolClientId!,
    },
  },
}, {
  ssr: false,
})

axios.defaults.baseURL = process.env.NEXT_PUBLIC_ApiEndpoint

// Set Authorization header on all requests if user is signed in; othwerise, redirect to login page
axios.interceptors.request.use(async (config) => {
  try {
    const authSession = await fetchAuthSession()
    config.headers.Authorization = authSession.tokens?.idToken?.toString()
  } catch (e) {
    const redirectRoute = getRedirectToLoginPageUrl()
    global.window.location.href = redirectRoute
  }

  return config
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry(failureCount, error: any) {
        const errorResponseStatus = error?.response?.status?.toString()
        if (errorResponseStatus?.startsWith('4')) return false

        return failureCount > 2
      },
    },
  },
})

const META = {
  NAME: 'Todo',
  URL: '',
  TITLE: 'Todo',
  DESCRIPTION: '',
  OG_IMAGE: '',
  LAST_UPDATED: new Date().toISOString(),
  APP_TWITTER_HANDLE: '',
  CREATOR_TWITTER_HANDLE: '',
}

export default function App({ Component }) {
  // HACK: If we set the default theme state to getInitialTheme(), we get 'Prop did not match'.
  // This is because localStorage isn't available on the server. It also results in FOUC when not the default theme.
  // Instead, we don't render the main content until after we setTheme inside useEffect (when we know we're on the client).
  const [theme, setTheme] = useState<string | undefined>()

  useEffect(() => {
    setTheme(getInitialTheme())
  }, [])

  return (
    <>
      <Head>
        {META.URL ? <link rel='canonical' href={META.URL} /> : null}
        <link rel='shortcut icon' type='image/x-icon' href='/favicon.ico' />
        {META.DESCRIPTION ? <meta name='description' content={META.DESCRIPTION} /> : null}
        <meta name='robots' content='index, follow' />
        {META.TITLE ? <meta property='og:title' content={META.TITLE} /> : null}
        <meta property='og:type' content='website' />
        {META.OG_IMAGE ? <meta property='og:image' content={META.OG_IMAGE} /> : null}
        {META.URL ? <meta property='og:url' content={META.URL} /> : null}
        {META.DESCRIPTION ? <meta property='og:description' content={META.DESCRIPTION} /> : null}
        {META.NAME ? <meta property='og:site_name' content={META.NAME} /> : null}
        <meta name='twitter:card' content='summary_large_image' />
        {META.APP_TWITTER_HANDLE ? <meta name='twitter:site' content={META.APP_TWITTER_HANDLE} /> : null}
        {META.CREATOR_TWITTER_HANDLE ? <meta name='twitter:creator' content={META.CREATOR_TWITTER_HANDLE} /> : null}
        {META.NAME ? <meta name='twitter:title' content={META.NAME} /> : null}
        {META.OG_IMAGE ? <meta name='twitter:image' content={META.OG_IMAGE} /> : null}
        {META.NAME ? <meta name='twitter:image:alt' content={META.NAME} /> : null}
        {META.DESCRIPTION ? <meta name='twitter:description' content={META.DESCRIPTION} /> : null}
        <meta content={META.LAST_UPDATED} name='og:updated_time' />
        <meta content={META.LAST_UPDATED} name='last-modified' />
        <meta charSet='UTF-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1'/>
      </Head>
      <QueryClientProvider client={queryClient}>
        {theme ? <ThemeContext.Provider value={{theme, setTheme}}>
          <ConfigProvider
            theme={{
              algorithm: THEMES[theme].algorithm,
              token: THEMES[theme].token,
            }}
          >
            <ErrorBoundary>
              <Component />
            </ErrorBoundary>
          </ConfigProvider>
        </ThemeContext.Provider> : null}
      </QueryClientProvider>
    </>
  )
}
