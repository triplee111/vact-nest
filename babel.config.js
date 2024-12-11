module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset',
    [
      '@babel/preset-typescript',
      {
        onlyRemoveTypeImports: true // this is important for proper files watching
      }
    ]
  ]
}
