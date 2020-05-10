import Link from 'next/link'

import { withApollo } from '../apollo/client'
import Layout from '../components/Layout'

const IndexPage = () => (
  <Layout>
    <h1>Hello Next.js 👋</h1>
    <p>
      <Link href='/about'>
        <a>About</a>
      </Link>
    </p>
  </Layout>
)

export default withApollo(IndexPage)
