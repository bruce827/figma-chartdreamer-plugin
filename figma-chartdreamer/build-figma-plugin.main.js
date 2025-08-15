module.exports = function (buildOptions) {
  return {
    ...buildOptions,
    mainFields: ['module', 'main'],
    platform: 'neutral',
    external: []
  }
}
