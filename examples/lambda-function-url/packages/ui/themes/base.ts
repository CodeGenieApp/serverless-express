import { theme } from 'antd'
import type { DerivativeFunc } from '@ant-design/cssinjs'
import { AliasToken, SeedToken } from 'antd/es/theme/internal'
import { MapToken } from 'antd/es/theme/interface'
// import type { AliasToken, MapToken, OverrideToken, SeedToken } from 'antd/es/config-provider/'
// https://ant.design/theme-editor

export type MappingAlgorithm = DerivativeFunc<SeedToken, MapToken>;
interface ThemeConfig {
  token: Partial<AliasToken>;
  algorithm: MappingAlgorithm | MappingAlgorithm[];
}
const fontSize = 14
const defaultTokens = {
  fontSize,
  borderRadius: 4,
  // This is the default Ant fontFamily with 'Open Sans' added to the start
  fontFamily: "Open Sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
}
const baseTheme: ThemeConfig = {
  algorithm: [
    theme.defaultAlgorithm,
  ],
  token: {
    ...defaultTokens,
    colorPrimary: '#579ddd'
  },
}

export default baseTheme