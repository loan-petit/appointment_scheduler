import User from './User'
import gql from 'graphql-tag'

type AuthPayload = {
  token: string
  expiresIn: number
  user: User
}

export const AuthPayloadFragments = {
  fields: gql`
    fragment AuthPayloadFields on AuthPayload {
      token
      expiresIn
      user {
        id
      }
    }
  `,
}

export const AuthPayloadOperations = {
  credentialsSignupMutation: gql`
    mutation CredentialsSignupMutation(
      $firstName: String!
      $lastName: String!
      $email: String!
      $password: String!
      $passwordConfirmation: String!
    ) {
      signup(
        firstName: $firstName
        lastName: $lastName
        email: $email
        password: $password
        passwordConfirmation: $passwordConfirmation
      ) {
        ...AuthPayloadFields
      }
    }
    ${AuthPayloadFragments.fields}
  `,
  oAuthSignupMutation: gql`
    mutation OAuthSignupMutation(
      $firstName: String!
      $lastName: String!
      $email: String!
      $oAuthToken: OAuthTokenInput!
    ) {
      signup(
        firstName: $firstName
        lastName: $lastName
        email: $email
        oAuthToken: $oAuthToken
      ) {
        ...AuthPayloadFields
      }
    }
    ${AuthPayloadFragments.fields}
  `,
  credentialsSigninMutation: gql`
    mutation CredentialsSigninMutation($email: String!, $password: String!) {
      signin(email: $email, password: $password) {
        ...AuthPayloadFields
      }
    }
    ${AuthPayloadFragments.fields}
  `,
  oAuthSigninMutation: gql`
    mutation OAuthSigninMutation($oAuthToken: OAuthTokenInput!) {
      signin(oAuthToken: $oAuthToken) {
        ...AuthPayloadFields
      }
    }
    ${AuthPayloadFragments.fields}
  `,
}

export default AuthPayload
