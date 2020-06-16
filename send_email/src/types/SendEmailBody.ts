import { RemoteResourceInfo } from './RemoteResources'

type SendEmailBody = {
  toAddresses: string[]
  html: string
  subject: string
  sender: string
  replyToAddresses: string[]
  resources?: RemoteResourceInfo[]
}

export const isSendEmailBody = (obj: SendEmailBody): obj is SendEmailBody => {
  return (
    obj.toAddresses.length > 0 &&
    obj.html !== undefined &&
    obj.subject !== undefined &&
    obj.sender !== undefined &&
    obj.replyToAddresses.length > 0
  )
}

export default SendEmailBody
