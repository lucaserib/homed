import { useState, useCallback } from 'react';
import { Image, Text, View, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { GoogleInputProps } from 'types/type';
import { shadows } from 'helpers/shadows';

import { icons } from '../constants';
import { fetchAPI } from '../lib/fetch';

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

const GoogleTextInput = ({
  icon,
  initialLocation,
  containerStyle = '',
  textInputBackgroundColor = 'white',
  handlePress,
}: GoogleInputProps) => {
  const [input, setInput] = useState('');
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const searchPlaces = useCallback(async (text: string) => {
    if (text.length < 3) {
      setPredictions([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetchAPI(`/maps/search-places?input=${encodeURIComponent(text)}`);
      if (response?.success && response?.data) {
        setPredictions(response.data);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Erro ao buscar lugares:', error);
      setPredictions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getPlaceDetails = useCallback(
    async (placeId: string, description: string) => {
      try {
        const response = await fetchAPI(`/maps/place-details?place_id=${placeId}`);
        if (response?.success && response?.data?.geometry?.location) {
          const location = response.data.geometry.location;
          handlePress({
            latitude: location.lat,
            longitude: location.lng,
            address: description,
          });
        }
      } catch (error) {
        console.error('Erro ao obter detalhes do lugar:', error);
      }
      setShowResults(false);
      setInput(description);
    },
    [handlePress]
  );

  const handleInputChange = (text: string) => {
    setInput(text);
    searchPlaces(text);
  };

  const handleSelectPrediction = (prediction: PlacePrediction) => {
    getPlaceDetails(prediction.place_id, prediction.description);
  };

  return (
    <View className={`relative ${containerStyle}`}>
      <View className="flex flex-row items-center rounded-xl">
        <View className="ml-3 h-6 w-6 items-center justify-center">
          <Image source={icon ? icon : icons.search} className="h-5 w-5" resizeMode="contain" tintColor="#6B7280" />
        </View>

        <TextInput
          className="flex-1 px-3 py-3.5 font-JakartaMedium text-sm text-gray-900"
          placeholder={initialLocation ?? 'Para onde deseja ir?'}
          placeholderTextColor="#9CA3AF"
          value={input}
          onChangeText={handleInputChange}
          style={{ backgroundColor: textInputBackgroundColor }}
          numberOfLines={1}
          ellipsizeMode="tail"
        />
      </View>

      {showResults && predictions.length > 0 && (
        <View
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-60 rounded-xl border border-gray-200 bg-white"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 8,
          }}>
          <FlatList
            data={predictions}
            keyExtractor={(item) => item.place_id}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="border-b border-gray-100 px-4 py-3"
                onPress={() => handleSelectPrediction(item)}
                activeOpacity={0.7}>
                <Text className="font-JakartaSemiBold text-sm text-gray-900">
                  {item.structured_formatting.main_text}
                </Text>
                <Text className="font-JakartaMedium text-xs text-gray-500 mt-0.5">
                  {item.structured_formatting.secondary_text}
                </Text>
              </TouchableOpacity>
            )}
            scrollEnabled
            nestedScrollEnabled
          />
        </View>
      )}

      {loading && (
        <View
          className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-gray-200 bg-white p-4"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 8,
          }}>
          <Text className="text-center font-JakartaMedium text-sm text-gray-500">Buscando...</Text>
        </View>
      )}
    </View>
  );
};

export default GoogleTextInput;
