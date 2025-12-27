const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Configuração para resolver conflitos do Stripe no web
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

config.resolver.alias = {
  ...config.resolver.alias,
  // Resolver módulos nativos problemáticos no web
  'react-native/Libraries/Utilities/codegenNativeCommands': require.resolve('react-native-web/dist/modules/UnimplementedView/index.js'),
  'react-native/Libraries/Utilities/codegenNativeComponent': require.resolve('react-native-web/dist/modules/UnimplementedView/index.js'),
};

// Configurar resolver para plataformas específicas
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs'];


// Platform-specific resolver for native modules
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = withNativeWind(config, { input: './global.css' });
