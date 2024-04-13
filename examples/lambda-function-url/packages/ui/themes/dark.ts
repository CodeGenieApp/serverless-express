import { ThemeConfig } from 'antd/es/config-provider/context'
import { theme } from 'antd'
import baseTheme from './base'

const darkTheme: ThemeConfig = {
  ...baseTheme,
  algorithm: [
    theme.darkAlgorithm,
  ],
  token: {
    ...baseTheme.token,
  },
}

export default darkTheme