const path = require('path')
const webpack = require('webpack')
const fs = require('fs')

const proj = require('./config')

const isOfficial =
  process.env.NODE_ENV === 'production' &&
  process.env.VUE_PRODUCTION_TYPE === 'official'

module.exports = {
  publicPath: proj.publicPath,
  outputDir: 'src/build',
  assetsDir: 'app',
  productionSourceMap: !isOfficial,
  css: {
    sourceMap: !isOfficial
  },

  lintOnSave: process.env.NODE_ENV !== 'production',

  devServer: {
    allowedHosts: ['.ngrok.io'],
    public: '0.0.0.0',
    host: '0.0.0.0',
    watchOptions: {
      ignored: /node_modules/,
      aggregateTimeout: 300,
      poll: 500
    },
    proxy: {
      '/api': {
        target: process.env.VUE_APP_API,
        changeOrigin: true, // needed for virtual hosted sites
        secure: false, // boolean, if you want to verify the SSL Certs
        pathRewrite: {
          '^/api/': '/'
        }
      }
    }
    // ref: https://github.com/chimurai/http-proxy-middleware : full proxy middleware options
  },

  configureWebpack: {
    entry: './src/app/main.ts',
    externals: {
      jquery: 'jQuery'
    },
    resolve: {
      alias: {
        '@': join('src/app'),
        '@css': join('src/app/assets/css'),
        '@img': join('src/app/assets/img'),
        '@game': join('src/app/game'),
        '@src': join('src')
      }
    }
  },

  chainWebpack: config => {
    /**
     * --------------------------------------------------------------------------------------
     * Copy plugin:
     *
     * 設定 public folder 打包後不需複製的檔案
     * --------------------------------------------------------------------------------------
     */
    config.plugins.delete('copy')

    /**
     * --------------------------------------------------------------------------------------
     * Define plugin
     *
     * 傳送路徑參數至專案
     * --------------------------------------------------------------------------------------
     */
    config.plugin('define').tap(args => {
      Object.assign(args[0]['process.env'], {
        PROJ_PATH: JSON.stringify(proj.path),
        PROJ_PLATFORM: JSON.stringify(proj.platform),
        PROJ_ROUTER_BASE: JSON.stringify(proj.routerBase),
        PROJ_UPLOAD_PATH: JSON.stringify(proj.uploadPath)
      })

      return args
    })

    /**
     * --------------------------------------------------------------------------------------
     * Html plugin
     *
     * 基本模版設定，改用 index.pug
     * --------------------------------------------------------------------------------------
     */
    config.plugin('html').tap(args => {
      args[0].filename =
        process.env.NODE_ENV === 'production' &&
          (process.env.VUE_PRODUCTION_TYPE === 'staging' ||
            process.env.VUE_PRODUCTION_TYPE === 'official')
          ? 'app.html'
          : 'index.html'

      args[0].template = getTemplate(proj.platform)
      args[0].inject = true

      if (isOfficial) {
        args[0].minify = {
          removeComments: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true
          // more options:
          // https://github.com/kangax/html-minifier#options-quick-reference
        }
      }

      return args
    })

    /**
     * --------------------------------------------------------------------------------------
     * Images rule
     *
     * 設定輸出的圖片格式與位置
     * --------------------------------------------------------------------------------------
     */
    config.module
      .rule('images')
      .exclude.add(join('src/app/game'))
      .end()

    config.module
      .rule('images')
      .use('url-loader')
      .loader('url-loader')
      .tap(options => {
        options.fallback.options.name = 'app/img/[name].[hash:6].[ext]'
        return options
      })

    config.module
      .rule('cursor')
      .test(/\.(cur)(\?.*)?$/)
      .use('url-loader')
      .loader('url-loader')
      .options({
        limit: 4096,
        fallback: {
          loader: require.resolve('file-loader'),
          options: { name: 'app/img/[name].[hash:6].[ext]' }
        }
      })

    /**
     * --------------------------------------------------------------------------------------
     * Bundle analyzer plugin
     *
     * 透過 cmd 方式啟用 webpack bundle analyzer server
     * 單純輸出報告使用 vue-cli build 模式預設參數 --report
     * --------------------------------------------------------------------------------------
     */
    if (Object.hasOwnProperty.call(proj.args, 'analyze')) {
      const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
        .BundleAnalyzerPlugin

      config
        .plugin('webpack-bundle-analyzer')
        .use(BundleAnalyzerPlugin)
        .tap(args => {
          args.push({
            analyzerMode: 'server',
            analyzerPort: 7000
          })

          return args
        })
    }

    /**
     * --------------------------------------------------------------------------------------
     * Limit chunk count plugin &
     * Min chunk size plugin
     *
     * 設定 code splitting 的限制條件
     * --------------------------------------------------------------------------------------
     */
    // config
    //   .plugin('min-size')
    //   .use(webpack.optimize.MinChunkSizePlugin)
    //   .tap(() => [{
    //     minChunkSize: 10000
    //   }])

    // config
    //   .plugin('limit-count')
    //   .use(webpack.optimize.LimitChunkCountPlugin)
    //   .tap(() => [
    //     { maxChunks: 10 }
    //   ])
    /**
     * --------------------------------------------------------------------------------------
     * Terser plugin
     *
     * webpack v4 預設使用的 js 壓縮套件
     * --------------------------------------------------------------------------------------
     */
    config.optimization.minimizer('terser').tap(args => {
      args[0].terserOptions.compress.drop_console = true
      return args
    })

    /**
     * --------------------------------------------------------------------------------------
     * Compression plugin
     *
     * 預先產出壓縮後的打包文件
     * --------------------------------------------------------------------------------------
     */
    const CompressionPlugin = require('compression-webpack-plugin')
    config
      .plugin('compression')
      .use(CompressionPlugin)
      .tap(args => {
        args.push({
          test: /\.(js|css)(\?.*)?$/i,
          threshold: 8192
        })

        return args
      })

    /**
     * --------------------------------------------------------------------------------------
     * Typescript checker plugin
     *
     * 子專案可以進一步使用各別設定的 tsconfig
     * --------------------------------------------------------------------------------------
     */
    const ForkTsChecker = require('fork-ts-checker-webpack-plugin')
    config.plugin('fork-ts-checker').use(ForkTsChecker, [
      {
        typescript: {
          configFile: 'tsconfig.json',
          memoryLimit: 2048
        }
      }
    ])

    /**
     * --------------------------------------------------------------------------------------
     * Svg sprite plugin
     *
     * 各專案 assets/svg/icon 內的檔案，自動注入 APP，透過 wrapper: SvgIcon 元件調用
     * --------------------------------------------------------------------------------------
     */
    const SvgSpritePlugin = require('svg-sprite-loader/plugin')

    const svgRule = config.module.rule('svg')
    const svgSpriteRule = config.module.rule('svg-sprite-loader')

    svgRule.exclude
      .add(join('src/icon'))
      .end()

    svgSpriteRule
      .test(/\.(svg)(\?.*)?$/)
      .include
      .add(join('src/icon/'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        extract: false,
        // spriteFilename: svgPath =>
        //   `app/img/${path.basename(path.dirname(svgPath))}.[hash:6].svg`,
        symbolId: svgPath =>
          `${path.basename(path.dirname(svgPath))}-${path.basename(
            svgPath,
            '.svg'
          )}`
      })

    svgSpriteRule.use('svgo-loader').loader('svgo-loader')

    config
      .plugin('svg-sprite')
      .use(SvgSpritePlugin)
      .tap(args => {
        args[0] = {
          plainSprite: true
        }
        return args
      })

    /**
     * --------------------------------------------------------------------------------------
     * Phaser/Pixi rules
     *
     * 關閉圖片檔轉成 base64 格式
     * 設定輸出的 json 檔案位置
     * --------------------------------------------------------------------------------------
     */
    config.module
      .rule('raw-loader')
      .test([/\.vert$/, /\.frag$/])
      .include.add(join('src/app/game/assets'))
      .end()
      .use('raw-loader')
      .loader('raw-loader')

    config.module
      .rule('game-images')
      .test(/\.(png|jpe?g|gif|webp)(\?.*)?$/)
      .include.add(join('src/app/game/assets'))
      .end()
      .use('url-loader')
      .loader('url-loader')
      .tap(() => ({
        limit: false,
        fallback: {
          loader: require.resolve('file-loader'),
          options: { name: 'app/game/img/[name].[hash:6].[ext]' }
        }
      }))

    config.module
      .rule('game-json')
      .type('javascript/auto')
      .test(/\.json$/)
      .include.add(join('src/app/game/assets'))
      .end()
      .use('file-loader')
      .loader('file-loader')
      .tap(() => ({ name: 'app/game/json/[name].[hash:6].[ext]' }))
  }
}

function join(dir) {
  return path.join(__dirname, dir)
}

function getTemplate(platform) {
  const path = join(`src/app/template/`)

  if (fs.existsSync(`${path}index.pug`)) return `${path}index.pug`

  if (fs.existsSync(`${path}index.html`)) return `${path}index.html`

  if (fs.existsSync(`public/template/${platform}.pug`)) return `public/template/${platform}.pug`

  return join('public/template/default.pug') // 預設模版
}
