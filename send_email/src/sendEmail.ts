import * as AWS from 'aws-sdk'

interface sendEmailBody {
  toAddresses: [string]
  html: string
  subject: string
  sender: string
  replyToAddresses: [string]
}

const sendEmail = (body: sendEmailBody) => {
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

  // Create the promise and SES service object
  return new AWS.SES().sendEmail(params).promise()
}

export default sendEmail
