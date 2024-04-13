export default function getRedirectToLoginPageUrl() {
  const pathname = window.location.pathname
  return pathname === '/' ? '/' : `/?redirect=${pathname}`
}