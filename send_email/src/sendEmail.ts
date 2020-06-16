import * as AWS from 'aws-sdk'

import loadAWSConfig from './services/aws'
import SendEmailBody from './types/SendEmailBody'

var isAWSInitiated = false

const sendEmail = async (body: SendEmailBody) => {
  if (!isAWSInitiated) {
    loadAWSConfig()
    isAWSInitiated = true
  }

  var params = {
    Destination: {
      ToAddresses: body.toAddresses
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: body.html
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: body.subject
      }
    },
    Source: body.sender,
    ReplyToAddresses: body.replyToAddresses
  }

  // Create SES service object and send the email
  return await new AWS.SES().sendEmail(params).promise()
}

export default sendEmail
