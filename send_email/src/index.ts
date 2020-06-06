import * as Koa from "koa";
import * as cors from "@koa/cors";
import * as koaBody from "koa-body";
import * as Router from "koa-router";
import * as NodeCache from "node-cache";

import loadAWSConfig from "./services/aws";
import sendEmail from "./sendEmail";
import SendEmailBody from "./types/SendEmailBody";
import { RemoteResourceInfo, RemoteResource } from "./types/RemoteResources";
import fetchResources from "./utils/fetchResources";

const app = (module.exports = new Koa());
const router = new Router();

const cache = new NodeCache();

loadAWSConfig();

app.use(cors());
app.use(koaBody());

// Error handling middleware
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = err.message;
    ctx.app.emit("error", err, ctx);
  }
});

router.post("/", async (ctx) => {
  const body: SendEmailBody = ctx.request.body;

  var remoteResources: RemoteResource[] = cache.get("remoteResources") ?? [];
  if (body.resources) {
    remoteResources = remoteResources.concat(
      await fetchResources(body.resources)
    );
    cache.set("remoteResources", remoteResources);
  }

  const data = await sendEmail(body, remoteResources);

  ctx.body = { messageId: data.MessageId };
});

router.post("/prefetchRemoteResources", async (ctx) => {
  const body: RemoteResourceInfo[] = ctx.request.body;

  var remoteResources: RemoteResource[] = cache.get("remoteResources") ?? [];
  cache.set(
    "remoteResources",
    remoteResources.concat(await fetchResources(body))
  );

  ctx.body = { isPrefetchDone: true };
});

app.use(router.routes());

// makes sure a 405 Method Not Allowed is sent
app.use(router.allowedMethods());

if (!module.parent) app.listen(5000);
