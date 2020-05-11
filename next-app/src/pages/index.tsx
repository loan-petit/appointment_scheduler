import * as React from 'react'
import { useRouter } from 'next/router'
import Cookies from 'js-cookie'

const IndexPage = () => {
  const router = useRouter()

  React.useEffect(() => {
    const token = Cookies.get('token')
    if (token) {
      router.replace('/settings')
    } else {
      router.replace('/auth/signin')
    }
  })
  return <div />
}

export default IndexPage
