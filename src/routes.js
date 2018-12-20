// import Joi from 'joi';
// import { encrypt, decrypt } from './utils/encryption';

const path = require('path');
// const Wreck = require('wreck');
// const btoa = require('btoa');
// const Querystring = require('querystring');  // built-in module
const Wreck = require('wreck');

const config = require('./config/variables');

const routes = [
  // Note: only one route per will be used to fulfill a request.
  // In case of multiple routes matching the URL, the most "specific" route wins.
  // See http://hapijs.com/api#path-matching-order

  // Serve all files from the assets directory
  // Note: in production this also serves webpack bundles
  {
    method: 'GET',
    path: `${config.publicPaths.assets}{path*}`,
    handler: {
      directory: {
        path: config.paths.assets,
        index: false,
        listing: false,
        showHidden: false
      }
    }
  },
  {
    method: 'GET',
    path: '/',
    config: {
      handler(request, h) {
        return h.view('app', {
          view: 'index',
          props: {}
        });
      }
    }
  }

];

// Serve white-listed files from the webRoot directory
config.server.publicFiles.forEach((filename) => {
  routes.push({
    method: 'GET',
    path: `/${filename}`,
    handler: {
      file: {
        path: path.join(config.paths.webRoot, filename)
      }
    }
  });
});

// DEV SETUP
if (process.env.NODE_ENV === 'development') {
// Proxy webpack assets requests to webpack-dev-server
// Note: in development webpack bundles are served from memory, not filesystem
  routes.push({
    method: 'GET',
    path: `${config.publicPaths.build}{path*}`, // this includes HMR patches, not just webpack bundle files
    handler: {
      proxy: {
        host: config.server.host,
        port: config.webpack.port,
        passThrough: true
      }
    }
  });

// Note: We also make requests to Webpack Dev Server EventSource endpoint (typically /__webpack_hmr).
// We don't need to proxy these requests because we configured webpack-hot-middleware
// to request them directly from a webpack dev server URL in webpack-config.js
}

module.exports = routes;
