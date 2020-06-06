import * as AWS from 'aws-sdk'
import * as juice from 'juice'
import { comb } from 'email-comb'
import { crush } from 'html-crush'

import SendEmailBody from './types/SendEmailBody'
import { RemoteResource } from './types/RemoteResources'

const sendEmail = async (
  body: SendEmailBody,
  remoteResources: RemoteResource[]
) => {
  var html: string = body.html

  if (body.resources) {
    var styles = ''

    body.resources.forEach(resourceInfo => {
      const resource = remoteResources.find(
        v => v.info.name === resourceInfo.name
      )

      if (resource?.info.rel === 'stylesheet') {
        styles += resource.content
      }
    })

    styles = `<style>${styles}</style>`

    html = juice(styles + html)
    html = comb(html).result
    html = crush(html, { removeLineBreaks: true }).result
  }

  var params = {
    Destination: {
      ToAddresses: body.toAddresses
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: html
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
