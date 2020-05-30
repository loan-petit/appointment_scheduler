import * as Koa from 'koa'
import * as cors from '@koa/cors'
import * as koaBody from 'koa-body'

import sendEmail from './sendEmail'
import loadAWSConfig from './services/aws'

const app = (module.exports = new Koa())

loadAWSConfig()

app.use(cors())
app.use(koaBody())

// Error handling middleware
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    ctx.status = err.status || 500
    ctx.body = err.message
    ctx.app.emit('error', err, ctx)
  }
})

app.use(async function (ctx) {
  const body = ctx.request.body
  const data = await sendEmail(body)
  ctx.body = { messageId: data.MessageId }
})

if (!module.parent) app.listen(3000)
