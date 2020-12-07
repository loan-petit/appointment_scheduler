import * as React from 'react'
import { useQuery } from '@apollo/react-hooks'

import User, { UserOperations } from '../../models/User'
import LoadingOverlay from '../shared/LoadingOverlay'
import Head from 'next/head'

type Props = {
  user?: User
  username?: string
}

const Layout: React.FunctionComponent<Props> = ({
  children,
  user,
  username,
}) => {
  if (!user) {
    const userQueryResult = useQuery(UserOperations.userPublicFieldsOnly, {
      variables: {
        username: username,
      },
    })

    // Verify UserQuery result
    if (userQueryResult.loading) return <LoadingOverlay />
    else if (userQueryResult.error) {
      return (
        <p className='error-message'>
          Une erreur est survenue. Veuillez-réessayer.
        </p>
      )
    }
    user = userQueryResult.data.user
  }

  return (
    <>
      <Head>
        <title>
          {`Prise de rendez-vous - ${user?.firstName} ${user?.lastName}`}
        </title>
        <meta charSet='utf-8' />
        <meta name='viewport' content='initial-scale=1.0, width=device-width' />
      </Head>

      <div className='flex items-center justify-center p-4 md:my-10'>
        <div className='container flex flex-col w-full mx-auto rounded-lg shadow-xl md:flex-row'>
          <div className='flex flex-col justify-center py-4 text-center bg-gray-100 rounded-t-lg md:rounded-l-lg md:w-1/3'>
            <h1>{`${user?.firstName} ${user?.lastName}`}</h1>
            {user?.websiteUrl && (
              <h6 className='py-2'>
                Site web :
                <a
                  href={user.websiteUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-gray-600 hover:text-gray-700'
                >
                  {` ${user.websiteUrl}`}
                </a>
              </h6>
            )}
          </div>
          <div className='w-full p-6'>{children}</div>
        </div>
      </div>
    </>
  )
}

export default Layout
