module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // React Native Vector Icons için gerekli plugin
    ],
  };
}; 