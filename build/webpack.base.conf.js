var path = require('path')
var config = require('../config')
var utils = require('./utils')
var projectRoot = path.resolve(__dirname, '../')
var ServiceWorkerWebpackPlugin = require('serviceworker-webpack5-plugin')
var CopyPlugin = require('copy-webpack-plugin');
var { VueLoaderPlugin } = require('vue-loader')
var ESLintPlugin = require('eslint-webpack-plugin');
var StylelintPlugin = require('stylelint-webpack-plugin');

var env = process.env.NODE_ENV
// check env & config/index.js to decide weither to enable CSS Sourcemaps for the
// various preprocessor loaders added to vue-loader at the end of this file
var cssSourceMapDev = (env === 'development' && config.dev.cssSourceMap)
var cssSourceMapProd = (env === 'production' && config.build.productionSourceMap)
var useCssSourceMap = cssSourceMapDev || cssSourceMapProd

var now = Date.now()

module.exports = {
  entry: {
    app: './src/main.js'
  },
  output: {
    path: config.build.assetsRoot,
    publicPath: process.env.NODE_ENV === 'production' ? config.build.assetsPublicPath : config.dev.assetsPublicPath,
    filename: '[name].js',
    chunkFilename: '[name].js'
  },
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  },
  resolve: {
    extensions: ['.mjs', '.js', '.jsx', '.vue'],
    modules: [
      path.join(__dirname, '../node_modules')
    ],
    alias: {
      'static': path.resolve(__dirname, '../static'),
      'src': path.resolve(__dirname, '../src'),
      'assets': path.resolve(__dirname, '../src/assets'),
      'components': path.resolve(__dirname, '../src/components'),
      'vue-i18n': 'vue-i18n/dist/vue-i18n.runtime.esm-bundler.js'
    },
    fallback: {
      'querystring': require.resolve('querystring-es3'),
      'url': require.resolve('url/')
    }
  },
  module: {
    noParse: /node_modules\/localforage\/dist\/localforage.js/,
    rules: [
      {
        enforce: 'post',
        test: /\.(json5?|ya?ml)$/, // target json, json5, yaml and yml files
        type: 'javascript/auto',
        loader: '@intlify/vue-i18n-loader',
        include: [ // Use `Rule.include` to specify the files of locale messages to be pre-compiled
          path.resolve(__dirname, '../src/i18n')
        ]
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          compilerOptions: {
            isCustomElement(tag) {
              if (tag === 'pinch-zoom') {
                return true
              }
              return false
            }
          }
        }
      },
      {
        test: /\.jsx?$/,
        include: projectRoot,
        exclude: /node_modules\/(?!tributejs)/,
        use: 'babel-loader'
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        type: 'asset',
        generator: {
          filename: utils.assetsPath('img/[name].[hash:7][ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        type: 'asset',
        generator: {
          filename: utils.assetsPath('fonts/[name].[hash:7][ext]')
        }
      },
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto'
      }
    ]
  },
  plugins: [
    new ServiceWorkerWebpackPlugin({
      entry: path.join(__dirname, '..', 'src/sw.js'),
      filename: 'sw-pleroma.js'
    }),
    new ESLintPlugin({
      extensions: ['js', 'vue'],
      formatter: require('eslint-formatter-friendly')
    }),
    new StylelintPlugin({}),
    new VueLoaderPlugin(),
    // This copies Ruffle's WASM to a directory so that JS side can access it
    new CopyPlugin({
      patterns: [
        {
          from: "node_modules/@ruffle-rs/ruffle/**/*",
          to: "static/ruffle/[name][ext]"
        },
      ],
      options: {
        concurrency: 100,
      },
    })
  ]
}
