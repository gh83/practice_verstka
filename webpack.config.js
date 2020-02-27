const path = require('path')
const fs = require('fs')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetWebpackPlugin = require('optimize-css-assets-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')

const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

const PAGES_DIR = path.resolve(__dirname, 'src/pug/pages/')
const PAGES = fs.readdirSync(PAGES_DIR).filter(fileName => fileName.endsWith('.pug'))

const optimization = () => {
  const config = {
    splitChunks: { chunks: 'all' }
  }
  if (isProd) {
    config.minimizer = [
      new OptimizeCssAssetWebpackPlugin(),
      new TerserWebpackPlugin()
    ]
  }
  return config
}

const filename = ext => isDev ? `[name].${ext}` : `[hash].${ext}`

const cssLoaders = extra => {
  const loaders = [
    {
      loader: MiniCssExtractPlugin.loader,
      options: { hmr: isDev, reloadAll: true },
    },
    'css-loader'
  ]
  if (extra) loaders.push(extra)

  return loaders
}

const babelOptions = preset => {
  const opts = {
    presets: ['@babel/preset-env']
  }
  if (preset) opts.presets.push(preset)

  return opts
}

const jsLoaders = () => {
  const loaders = [{
    loader: 'babel-loader',
    options: babelOptions()
  }]

  if (isDev) loaders.push('eslint-loader')

  return loaders
}

const plugins = () => {
  return [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin([{
      from: path.resolve(__dirname, 'src/static/'), to: path.resolve(__dirname, 'dist')
    }]),
    new MiniCssExtractPlugin({
      filename: filename('css')
    }),
    ...PAGES.map(page => new HtmlWebpackPlugin({
      template: `${PAGES_DIR}/${page}`,
      filename: `./${page.replace(/\.pug/, '.html')}`,
      minify: { collapseWhitespace: isProd }
    }))
  ]
}

module.exports = {
  context: path.resolve(__dirname, 'src'),
  mode: 'development',
  entry: {
    main: ['@babel/polyfill', './index.js']
  },
  output: {
    filename: filename('js'),
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  optimization: optimization(),
  devServer: {
    port: 8081,
    hot: isDev,
    overlay: { warnings: true, errors: true }
  },
  devtool: isDev ? 'source-map' : '',
  plugins: plugins(),
  module: {
    rules: [
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: cssLoaders()
      },
      {
        test: /\.less$/,
        exclude: /node_modules/,
        use: cssLoaders('less-loader')
      },
      {
        test: /\.(png|jpg|gif)$/,
        loader: 'file-loader',
        options: {
          name: filename('[ext]'),
          outputPath: `assets/`
        }
      },
      {
        test: /\.(ttf|woff|woff2|eot|svg)$/,
        loader: 'file-loader',
        options: {
          name: filename('[ext]'),
          outputPath: `assets/`
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: jsLoaders()
      },
      {
        test: /\.pug$/,
        loader: 'pug-loader',
        options: { pretty: isDev }
      }
    ]
  }
}
