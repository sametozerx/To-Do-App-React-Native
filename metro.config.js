const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Vector Icons için font dosyalarını dahil et
config.resolver.assetExts.push('ttf', 'otf');

module.exports = config; 