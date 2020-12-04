import "dotenv/config";

import * as Koa from "koa";
import * as cors from "@koa/cors";
import * as koaBody from "koa-body";
import * as Router from "koa-router";
import * as NodeCache from "node-cache";
import * as path from "path";
import * as Queue from "bull";

import SendEmailBody, { isSendEmailBody } from "./types/SendEmailBody";
import { RemoteResourceInfo, RemoteResource } from "./types/RemoteResources";
import fetchResources from "./utils/fetchResources";

const cache = new NodeCache();

const emailQueue = new Queue("email", process.env.REDIS_URL as string);
emailQueue.process(
  __dirname + "/emailQueueProcessor" + path.extname(__filename)
);

const port = process.env.KOA_PORT || 5000;

const app = new Koa();
const router = new Router();

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
  var body: SendEmailBody;
  if (isSendEmailBody(ctx.request.body)) {
    body = ctx.request.body;
  } else {
    throw Error(
      "Body isn't correctly formatted and must be of type SendEmailBody"
    );
  }

  var remoteResources: RemoteResource[] = cache.get("remoteResources") ?? [];
  if (body.resources) {
    remoteResources = remoteResources.concat(
      await fetchResources(body.resources)
    );
    cache.set("remoteResources", remoteResources);
  }

  // Email sending and resource inlining takes is slow,
  // so we use a queue instead of waiting for completion.
  emailQueue.add({ body: body, remoteResources: remoteResources });

  ctx.body = { status: "OK", message: "Email will be send shortly" };
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

app.listen(port, () =>
  console.log(`🚀 Server ready at: http://localhost:${port}`)
);
