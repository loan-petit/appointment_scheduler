import React from 'react'
import Router from 'next/router'
import gql from 'graphql-tag'
import { useQuery, useMutation } from '@apollo/react-hooks'

import { withApollo } from '../apollo/client'
import LoadingOverlay from '../components/shared/LoadingOverlay'
import Layout from '../components/adminSite/Layout'
import UpdateInformations from '../components/adminSite/settings/UpdateInformations'
import UpdatePassword from '../components/adminSite/settings/UpdatePassword'
import User, { UserFragments } from '../models/User'
import GoogleLogin, {
  GoogleLoginResponse,
  GoogleLoginResponseOffline,
} from 'react-google-login'

const CurrentUserQuery = gql`
  query CurrentUserQuery {
    me {
      user {
        ...UserFields
      }
    }
  }
  ${UserFragments.fields}
`

const UpdateCurrentUserWithOAuthMutation = gql`
  mutation UpdateCurrentUserWithOAuthMutation($oAuthToken: OAuthTokenInput!) {
    updateCurrentUser(oAuthToken: $oAuthToken) {
      id
    }
  }
`

const Settings = () => {
  const [googleAuthError, setGoogleAuthError] = React.useState('')

  const { loading, error, data } = useQuery(CurrentUserQuery)

  const [updateCurrentUserWithOAuth] = useMutation(
    UpdateCurrentUserWithOAuthMutation,
  )

  // Verify CurrentUserQuery result
  if (loading) return <LoadingOverlay />
  else if (error) {
    Router.push('/auth/signin')
    return <div />
  }
  const currentUser: User = data.me.user

  const onGoogleAuthSuccess = async (
    res: GoogleLoginResponse | GoogleLoginResponseOffline,
  ) => {
    res = res as GoogleLoginResponse
    try {
      await updateCurrentUserWithOAuth({
        variables: {
          oAuthToken: { accessToken: res.accessToken, idToken: res.tokenId },
        },
      })
    } catch (error) {
      if (error.graphQLErrors && error.graphQLErrors.length) {
        let message = error.graphQLErrors[0].message
        if (
          message.includes(
            'Unique constraint failed on the fields: (`googleId`)',
          )
        ) {
          return setGoogleAuthError(
            'Un compte est déjà associé à ce compte Google.',
          )
        }
      }
      setGoogleAuthError('Une erreur est survenue. Veuillez-réessayer.')
    }
  }

  return (
    <Layout>
      <section>
        <header className="flex items-center mb-4">
          <h5>Reliez votre compte à :</h5>
        </header>

        <GoogleLogin
          clientId={process.env.GOOGLE_CLIENT_ID as string}
          render={(renderProps) => (
            <button
              className="inline-flex items-center p-2 text-xs font-bold text-gray-800 bg-white rounded shadow outline-none focus:outline-none hover:shadow-md"
              type="button"
              onClick={renderProps.onClick}
              disabled={renderProps.disabled}
            >
              <img
                alt="Google"
                className="w-5 mr-1"
                src="/svg/googleLogo.svg"
              />
              Google
            </button>
          )}
          onSuccess={onGoogleAuthSuccess}
          onFailure={setGoogleAuthError}
        />
        {googleAuthError && (
          <p className="mt-4 form-submit-error">{googleAuthError}</p>
        )}
      </section>

      <hr className="my-12 border-b-1" />

      <section>
        <header className="flex items-center mb-8">
          <h5>Vos informations</h5>
        </header>

        <div className="md:w-1/2">
          <UpdateInformations currentUser={currentUser} />
        </div>
      </section>

      <hr className="my-12 border-b-1" />

      {currentUser.password && (
        <section>
          <header className="flex items-center mb-8">
            <h5>Changer votre mot de passe</h5>
          </header>

          <div className="md:w-1/2">
            <UpdatePassword />
          </div>
        </section>
      )}
    </Layout>
  )
}

export default withApollo(Settings)
