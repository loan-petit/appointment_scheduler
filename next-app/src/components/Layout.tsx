import * as React from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { useRouter } from 'next/router'

import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons'

import User from '../models/User'
import LoadingOverlay from './LoadingOverlay'

const CurrentUserQuery = gql`
  query CurrentUserQuery {
    me {
      user {
        id
        firstName
        lastName
      }
    }
  }
`

type Props = {
  title?: string
}

const Layout: React.FunctionComponent<Props> = ({
  children,
  title = 'Planificateur de rendez-vous',
}) => {
  const router = useRouter()
  const routes = [
    {
      path: '/settings',
      name: 'Paramètres',
    },
    {
      path: '/events',
      name: 'Événements',
    },
  ]

  const [isOpen, setIsOpen] = React.useState(false)

  const { loading, error, data } = useQuery(CurrentUserQuery)
  if (loading) return <LoadingOverlay />
  if (error) {
    router.push('/auth/signin')
    return <div />
  }
  var currentUser: User = data.me.user

  return (
    <>
      <Head>
        <title>
          {`${title} - ${currentUser?.firstName} ${currentUser?.lastName}`}
        </title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>

      <div className="flex-col w-full md:flex md:flex-row md:min-h-screen">
        <div className="flex flex-col flex-shrink-0 w-full text-gray-700 bg-white md:w-64">
          <div className="flex flex-row items-center justify-between flex-shrink-0 px-8 py-6">
            <h1 className="text-lg font-semibold tracking-widest text-gray-900 uppercase rounded-lg focus:outline-none focus:shadow-outline">
              {`${currentUser?.firstName} ${currentUser?.lastName}`}
            </h1>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 text-gray-800 rounded-lg md:hidden focus:outline-none focus:shadow-outline"
            >
              {isOpen ? (
                <FontAwesomeIcon icon={faTimes} size="lg" />
              ) : (
                <FontAwesomeIcon icon={faBars} size="lg" />
              )}
            </button>
          </div>

          <nav
            className={
              (!isOpen ? 'hidden ' : '') +
              'flex-grow px-4 pb-4 md:block md:pb-0 md:overflow-y-auto'
            }
          >
            {routes.map((route, i) => (
              <Link key={i} href={route.path} replace>
                <a
                  className={
                    'nav-item ' +
                    (router.pathname == route.path
                      ? 'text-gray-900 bg-gray-200'
                      : '')
                  }
                >
                  {route.name}
                </a>
              </Link>
            ))}
          </nav>
        </div>
        <div className="w-full p-10 bg-gray-100">{children}</div>
      </div>
    </>
  )
}

export default Layout