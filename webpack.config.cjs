const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

// ---------------------------------------------------------------------------
// Build for the game web components.
//
//   src/<game>/        -> source code of each web component (edit here)
//   dist/              -> compiled output:
//                           dbs-<game>.js   one file per component
//                           dbs-shared.js   shared Aurelia runtime (emitted
//                                           once two or more components share
//                                           code)
//                           dbs-full-bundle.js  every component in one file
//   docs/assets/js/    -> a copy of dbs-full-bundle.js consumed by docsify
//
// Aurelia relies on the standard TC39 decorators, which are transpiled by
// babel-loader (see babel.config.json). The @aurelia/webpack-loader compiles
// the paired *.html templates and *.css (as shadow-DOM scoped styles).
// ---------------------------------------------------------------------------

const cssLoader = { loader: 'css-loader' };
const postcssLoader = {
  loader: 'postcss-loader',
  options: {
    postcssOptions: {
      plugins: ['autoprefixer']
    }
  }
};

module.exports = function (env = {}) {
  const production = env.production || process.env.NODE_ENV === 'production';

  const entry = {
    // One entry per component.
    'dbs-quadrisgame': './src/quadrisgame/index.js',
    // A single self-contained bundle with every component, loaded by docsify.
    'dbs-full-bundle': [
      './src/quadrisgame/index.js'
    ]
  };

  return {
    target: 'web',
    mode: production ? 'production' : 'development',
    devtool: production ? undefined : 'eval-source-map',
    entry,
    optimization: {
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            // Fast minify mode: good size/speed balance and avoids some
            // Terser edge cases with the Aurelia runtime.
            compress: false
          }
        })
      ],
      splitChunks: {
        // Never split the all-in-one bundles: they must stay standalone.
        chunks: (chunk) => chunk.name !== 'dbs-full-bundle',
        name: 'dbs-shared',
        minChunks: 2,
        cacheGroups: {
          default: false,
          vendors: false,
          common: {
            name: 'dbs-shared',
            chunks: (chunk) => chunk.name !== 'dbs-full-bundle',
            minChunks: 2,
            priority: 10,
            reuseExistingChunk: true,
            enforce: true
          }
        }
      }
    },
    output: {
      clean: true,
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      environment: {
        arrowFunction: true,
        const: true,
        destructuring: true,
        forOf: true,
        dynamicImport: true,
        optionalChaining: true,
        templateLiteral: true
      }
    },
    resolve: {
      extensions: ['.js'],
      modules: [path.resolve(__dirname, 'src'), 'node_modules'],
      fullySpecified: false
    },
    module: {
      rules: [
        { test: /\.(png|svg|jpg|jpeg|gif)$/i, type: 'asset' },
        { test: /\.(woff|woff2|ttf|eot|svg|otf)(\?v=[0-9]\.[0-9]\.[0-9])?$/i, type: 'asset' },
        {
          test: /\.css$/i,
          // Styles imported from JS are injected into the document head.
          issuer: /\.js$/,
          use: ['style-loader', cssLoader, postcssLoader]
        },
        {
          test: /\.css$/i,
          // Styles paired with an .html template are handled by Aurelia
          // (injected into the component's shadow root).
          issuer: /\.html$/,
          use: [cssLoader, postcssLoader]
        },
        {
          test: /\.js$/i,
          use: [
            'babel-loader',
            {
              loader: '@aurelia/webpack-loader',
              options: { hmr: false }
            }
          ],
          exclude: /node_modules/
        },
        {
          test: /[/\\]src[/\\].+\.html$/i,
          use: {
            loader: '@aurelia/webpack-loader',
            options: {
              // 'open' keeps the shadow root reachable for e2e tests.
              defaultShadowOptions: { mode: 'open' }
            }
          },
          exclude: /node_modules/
        }
      ]
    },
    plugins: [
      production && new webpack.DefinePlugin({ 'module.hot': 'false' })
    ].filter(Boolean)
  };
};
