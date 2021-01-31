const Koa = require("koa")
const bodyParser = require("koa-bodyparser")
const axios = require("axios")
const app = new Koa();
app.use(bodyParser({
  enableTypes: ["xml", "text", "json", "form"],
}))
app.use(async (ctx) => {
  const {
    ruleValue,
  } = ctx.req.originalReq
  let { upstream, extractRegex } = JSON.parse(ruleValue)
  console.log(ctx.req.originalReq.url)
  if (ctx.headers.AVOID_LOOP) {
    throw new Error("request loop detected")
  }
  const requestHeaders = Object.assign({}, ctx.headers, {
    AVOID_LOOP: true,
  });
  const resultArr = await Promise.all([
    axios({
      method: ctx.method,
      headers: requestHeaders,
      url: ctx.req.originalReq.url,
      data: ctx.request.body,
      responseType: "text"
    }),
    axios({
      method: ctx.method,
      headers: requestHeaders,
      url: upstream,
      data: ctx.request.body,
      responseType: "text"
    }),
  ])
  if (resultArr.some(item => item.status !== 200)) {
    throw new Error("request failed")
  }
  if (!Array.isArray(extractRegex)) {
    extractRegex = [extractRegex]
  }
  const dataSource = resultArr[0].data
  const template = resultArr[1].data
  let result = template
  extractRegex.forEach((strRegex) => {
    const r = new RegExp(strRegex)
    const match = r.exec(dataSource)
    if (match) {
      result = result.replace(r, match[0])
    }
  })

  ctx.body = result
})

module.exports = (server /* , options */ ) => {
  // handle http request
  server.on('request', (req, res) => {
    try {
      app.callback()(req, res)
    } catch (e) {
      console.log(e)
      req.passThrough();
    }
  });

  // handle websocket request
  server.on('upgrade', (req, socket) => {
    // do something
    req.passThrough();
  });

  // handle tunnel request
  server.on('connect', (req, socket) => {
    // do something
    req.passThrough();
  });
};
