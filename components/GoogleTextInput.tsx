import { useState, useCallback } from 'react';
import { Image, Text, View, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { GoogleInputProps } from 'types/type';

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
    <View className={`relative z-50 ${containerStyle} mb-5`}>
      <View className="mx-5 flex flex-row items-center justify-center rounded-xl bg-white shadow-md shadow-neutral-300">
        <View className="ml-4 h-6 w-6 items-center justify-center">
          <Image source={icon ? icon : icons.search} className="h-6 w-6" resizeMode="contain" />
        </View>

        <TextInput
          className="flex-1 rounded-r-xl px-4 py-4 font-Jakarta text-base"
          placeholder={initialLocation ?? 'Para onde deseja ir?'}
          placeholderTextColor="gray"
          value={input}
          onChangeText={handleInputChange}
          style={{ backgroundColor: textInputBackgroundColor }}
        />
      </View>

      {showResults && predictions.length > 0 && (
        <View className="absolute left-5 right-5 top-16 z-50 max-h-60 rounded-xl bg-white shadow-lg">
          <FlatList
            data={predictions}
            keyExtractor={(item) => item.place_id}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="border-b border-gray-200 px-4 py-3"
                onPress={() => handleSelectPrediction(item)}>
                <Text className="font-JakartaSemiBold text-base">
                  {item.structured_formatting.main_text}
                </Text>
                <Text className="font-Jakarta text-sm text-gray-500">
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
        <View className="absolute left-5 right-5 top-16 z-50 rounded-xl bg-white p-4 shadow-lg">
          <Text className="text-center text-gray-500">Buscando...</Text>
        </View>
      )}
    </View>
  );
};

export default GoogleTextInput;
