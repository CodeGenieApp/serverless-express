import React from 'react'
import Document, {
  Html,
  Head,
  Main,
  NextScript,
} from 'next/document'

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html>
        <Head />
        <body>
          {/* HACK: Fixes FOUC https://github.com/vercel/next.js/issues/18769 */}
          <script>0</script>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
