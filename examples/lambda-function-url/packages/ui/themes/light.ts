import { ThemeConfig } from 'antd/es/config-provider/context'
import baseTheme from './base'

const lightTheme: ThemeConfig = {
  ...baseTheme,
  token: {
    ...baseTheme.token,
  },
}

export default lightTheme