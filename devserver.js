const Webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const webpackConfig = require('./webpack.config.js');
const path = require('path')

const compiler = Webpack(webpackConfig);
const devServerOptions = { open: true,  hot:false, liveReload: false, static: {
    directory: path.join(__dirname, 'public'),
    watch: false,
  }, 
  onListening: function (devServer) {
  if (!devServer) {
    throw new Error('webpack-dev-server is not defined');
  }
  const port = devServer.server.address().port;
  console.log('监听开始 on port:', port);
}};
const server = new WebpackDevServer(devServerOptions, compiler);

server.startCallback(() => {
  console.log('Successfully started server on http://localhost:8080');
});