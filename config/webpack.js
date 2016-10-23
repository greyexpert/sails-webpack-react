// config/webpack.js
const webpack = require('webpack');
const path = require('path');
const LessPluginCleanCSS = require('less-plugin-clean-css');

const debug = process.env.NODE_ENV === 'development';

const entry = [
  path.resolve(__dirname, '../assets/index.html'),
  path.resolve(__dirname, '../assets/js/index.js') // set your main javascript file
];
const plugins = [
  // prevents the inclusion of duplicate code into your bundle
  new webpack.optimize.DedupePlugin()
];

if (debug) {
  // add this entries in order to enable webpack HMR in browser
  entry.push('webpack/hot/dev-server');
  entry.push('webpack-dev-server/client?http://localhost:3000/');

  // HMR plugin
  plugins.push(new webpack.HotModuleReplacementPlugin({
    multiStep: true
  }));
} else {
  // Minify bundle (javascript and css)
  plugins.push(new webpack.optimize.UglifyJsPlugin({
    minimize: true,
    output: { comments: false },
    compress: { drop_console: true }
  }));
}

const configs = { // webpack config begin here
  entry: entry,
  output: {
    path: path.resolve(__dirname, '../.tmp/public'), // sails.js public path
    filename: 'bundle.js' // or 'bundle-[hash].js'
  },
  debug: debug,
  plugins: plugins,
  module: {
    preLoaders: [
      {
        test: /.(jpg|jpeg|png|gif|svg)$/, // Minify images using imagemin
        loader: 'image-webpack', // npm install --save image-webpack-loader
        query: {
          bypassOnDebug: true // do not minify when is in development mode
        }
      }
    ],
    loaders: [ // not all are necessary, choose wisely
      {
        test: /\.css$/, // load CSS files
        loaders: [
          'style', // npm install --save style-loader
          'css?root=' + __dirname + '/../assets', // npm install --save css-loader
          'autoprefixer?browsers=last 2 versions' // npm install --save autoprefixer-loader
        ]
      },
      {
        test: /\.scss$/, // load SASS files
        loaders: [
          'style',
          'css',
          'autoprefixer?browsers=last 2 versions',
          'sass?sourceMap' // npm install --save sass-loader node-sass
        ]
      },
      {
        test: /\.less$/, // load LESS files
        loaders: [
          'style',
          'css',
          'autoprefixer?browsers=last 2 versions',
          'less?sourceMap' // npm install --save less-loader less
        ]
      },
      {
        test: /\.png$/, // load PNG using base64 encode
        loader: 'url?limit=100000' // npm install --save url-loader
      },
      {
        test: /\.(jpg|gif)$/, // load image files
        loader: 'file' // npm install --save file-loader
      },
      {
          test: /\.html/, loader: 'file?name=[name].[ext]'
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, // load SVG using base64 encode
        loader: 'url?limit=10000&mimetype=image/svg+xml'
      },
      {
        test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, // load font files
        loader: 'url?limit=10000&mimetype=application/font-woff'
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, // load TTF font files
        loader: 'url?limit=10000&mimetype=application/octet-stream'
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, // load EOT font files
        loader: 'file'
      }
    ]
  },
  sassLoader: { // config sass-loader
    includePaths: [
      path.resolve(__dirname, '../assets/'),
      // if you want to use compass
      // npm install --save compass-mixins
      path.resolve(__dirname, '../node_modules/compass-mixins/lib')
    ]
  },
  lessLoader: { // config less-loader
    lessPlugins: [
      new LessPluginCleanCSS({advanced: true})
    ]
  },
  imageWebpackLoader: { // config image-webpack-loader
    optimizationLevel: 6, // imagemin options
    progressive: true,
    interlaced: true,
    pngquant: { // pngquant custom options
      quality: '65-90',
      speed: 4
    },
    svgo: { // svgo custom options
      plugins: [
        { removeViewBox: false },
        { removeUselessStrokeAndFill: false }
      ]
    }
  }
};

module.exports.webpack = {
  config: configs, // webpack config ends here
  development: { // dev server config
    // webpack: configs, // separate webpack config for the dev server
    config: { // webpack-dev-server config
      // This is handy if you are using a html5 router.
      historyApiFallback: false,
      // set value port as 3000,
      // open your browser at http://localhost:3000/ instead of http://localhost:1337/
      // for develop and debug your application
      port: 3000,
      // enable Hot Module Replacement with dev-server
      hot: true,
      // sails.js public path
      contentBase: path.resolve(__dirname, '../.tmp/public'),
      // bypass sails.js server
      proxy: {
        '*': {
          target: 'http://localhost:1337'
        }
      }
    }
  },
  watchOptions: {
    aggregateTimeout: 300
  }
};
