import { Linking, Platform, Alert } from 'react-native';

export const openGoogleMaps = async (latitude: number, longitude: number) => {
  const url = Platform.select({
    ios: `maps://app?daddr=${latitude},${longitude}`,
    android: `google.navigation:q=${latitude},${longitude}`,
  });

  if (!url) return;

  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Erro', 'Não foi possível abrir o Maps');
    }
  } catch (error) {
    console.error('Error opening Google Maps:', error);
    Alert.alert('Erro', 'Não foi possível abrir o Maps');
  }
};

export const openWaze = async (latitude: number, longitude: number) => {
  const url = `waze://?ll=${latitude},${longitude}&navigate=yes`;

  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      const webUrl = `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;
      await Linking.openURL(webUrl).catch(() => {
        Alert.alert('Erro', 'Waze não está instalado');
      });
    }
  } catch (error) {
    console.error('Error opening Waze:', error);
    Alert.alert('Erro', 'Waze não está instalado');
  }
};
