import { RemoteResourceInfo } from './RemoteResources'

type SendEmailBody = {
  toAddresses: string[]
  html: string
  subject: string
  sender: string
  replyToAddresses: string[]
  resources?: RemoteResourceInfo[]
}

export default SendEmailBody
