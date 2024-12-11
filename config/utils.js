/**
 * 啟動專案時，用於參數設定的 utilities
 */

const PROD_CDN_CONFIG = require('./prodCdn.json')

/**
 * 取得對應環境的前端路由基礎
 *
 * @params string    專案名稱
 * @params platforom 平台代碼
 * @return string
 */
function getRouterBase(project, platform) {
  if (process.env.NODE_ENV !== 'production') {
    return '/'
  }

  if (process.env.VUE_PRODUCTION_TYPE === 'staging') {
    return `/actions/act_evt/web_mem/${platform}/${project}` // 正測站網址片段
  }

  return `${platform}/${project}`
}

/**
 * 成品模式下取得平台對應的 CDN 路徑群
 *
 * @params string    專案名稱
 * @params platforom 平台代碼
 * @return string
 */
function getCdnPaths(project, platform) {
  if (
    platform === '' ||
    !PROD_CDN_CONFIG[platform] ||
    !PROD_CDN_CONFIG[platform][process.env.VUE_PRODUCTION_TYPE]
  ) {
    return process.env.NODE_ENV === 'production'
      ? {
        public: './',
        upload: `${process.env.VUE_APP_UPLOAD_URL}`
      }
      : {
        public: '/',
        upload: `${process.env.VUE_APP_UPLOAD_URL}`
      }
  }

  const CDN_CONFIG = PROD_CDN_CONFIG[platform][process.env.VUE_PRODUCTION_TYPE]

  return {
    public: `${CDN_CONFIG.public}${platform}/${project}`,
    upload: `${CDN_CONFIG.upload}${platform}/${project}`
  }
}

module.exports = {
  getRouterBase,
  getCdnPaths
}
