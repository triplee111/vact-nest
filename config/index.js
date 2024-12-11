const utils = require('./utils')

// 取得指令的路徑參數
const ARGS = require('minimist')(process.argv.slice(2))

// router base
const ROUTER_BASE = utils.getRouterBase(
  process.env.APP_NAME,
  process.env.APP_PLATFORM
) // 前端路由基礎

const FILE_PATH = utils.getCdnPaths(
  process.env.APP_NAME,
  process.env.APP_PLATFORM
) // CDN 路徑 for production

module.exports = {
  args: ARGS,
  name: process.env.APP_NAME,
  platform: process.env.APP_PLATFORM,
  routerBase: ROUTER_BASE,
  publicPath: FILE_PATH.public,
  uploadPath: FILE_PATH.upload
}
