module.exports = {
  /* 调整内联文件的大小限制，让小图片不转为base64 */
  chainWebpack: config => {
    config.module
        .rule('images')
        .use('url-loader')
        .loader('url-loader')
        .tap(options => Object.assign(options, { limit: 1 }))
  },
}