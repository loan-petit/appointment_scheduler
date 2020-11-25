import * as React from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Cookies from 'js-cookie'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faTimes, faArrowLeft } from '@fortawesome/free-solid-svg-icons'

import User from '../../models/User'
import LoadingOverlay from '../shared/LoadingOverlay'

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
  backButtonCallback?: VoidFunction
}

const Layout: React.FunctionComponent<Props> = ({
  children,
  title = 'Planificateur de rendez-vous',
  backButtonCallback,
}) => {
  const router = useRouter()
  const routes = [
    {
      path: '/appointments',
      name: 'Vos rendez-vous',
    },
    {
      path: '/appointmentTypes',
      name: "Types d'événements",
    },
    {
      path: '/customers',
      name: 'Clients',
    },
    {
      path: '/availabilities',
      name: 'Disponibilités',
    },
    {
      path: '/settings',
      name: 'Paramètres',
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

      <div className="flex-col w-full min-h-screen md:flex md:flex-row">
        <div className="flex flex-col flex-shrink-0 w-full text-gray-700 bg-white md:w-64">
          <div className="flex flex-row items-center px-8 py-6">
            {backButtonCallback && (
              <button
                onClick={backButtonCallback}
                className="pr-6 text-gray-800 focus:outline-none md:hidden"
              >
                <FontAwesomeIcon icon={faArrowLeft} size="lg" />
              </button>
            )}

            <div className="flex flex-row items-center justify-between flex-grow">
              <Link href="/">
                <h1 className="tracking-widest cursor-pointer focus:ring">
                  {`${currentUser?.firstName} ${currentUser?.lastName}`}
                </h1>
              </Link>

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-800 md:hidden focus:ring"
              >
                {isOpen ? (
                  <FontAwesomeIcon icon={faTimes} size="lg" />
                ) : (
                  <FontAwesomeIcon icon={faBars} size="lg" />
                )}
              </button>
            </div>
          </div>

          <nav
            className={
              (!isOpen ? 'hidden ' : '') +
              'flex-grow px-4 pb-4 md:block md:pb-0 md:overflow-y-auto'
            }
          >
            {routes.map((route, i) => (
              <Link key={i} href={route.path}>
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
            <a
              className="text-red-500 nav-item hover:text-red-500 focus:text-red-500"
              onClick={() => {
                Cookies.remove('token')
                router.push('/auth/signin')
              }}
            >
              Se déconnecter
            </a>
          </nav>
        </div>
        <div className="w-full p-10 bg-gray-100">{children}</div>
      </div>
    </>
  )
}

export default Layout
