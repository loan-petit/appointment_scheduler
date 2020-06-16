import { Job } from 'bull'
import * as juice from 'juice'
import { comb } from 'email-comb'
import { crush } from 'html-crush'

import sendEmail from './sendEmail'
import SendEmailBody from './types/SendEmailBody'
import { RemoteResource } from './types/RemoteResources'

interface JobInterface {
  body: SendEmailBody
  remoteResources: RemoteResource[]
}

export default async function (job: Job<JobInterface>) {
  const body = job.data.body
  const remoteResources = job.data.remoteResources

  var html = body.html

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

  return await sendEmail({ ...body, html: html })
}
