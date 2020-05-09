import Link from 'next/link'
import Layout from '../components/Layout'

const IndexPage = ({ props }: any) => (
  <Layout {...props}>
    <h1>Hello Next.js 👋</h1>
    <p>
      <Link href='/about'>
        <a>About</a>
      </Link>
    </p>
  </Layout>
)

export default IndexPage
