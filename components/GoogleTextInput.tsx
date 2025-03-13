import { Image, Text, View } from 'react-native';
import { GoogleInputProps } from 'types/type';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { icons } from '../constants';

const googlePlacesApiKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

const GoogleTextInput = ({
  icon,
  initialLocation,
  containerStyle,
  textInputBackgroundColor,
  handlePress,
}: GoogleInputProps) => (
  <View
    className={`relative z-50 flex flex-row items-center justify-center rounded-xl ${containerStyle} mb-5 `}>
    <GooglePlacesAutocomplete
      fetchDetails={true}
      debounce={200}
      placeholder="Para onde deseja ir?"
      styles={{
        textInputContainer: {
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 20,
          marginHorizontal: 20,
          position: 'relative',
          shadowColor: '#d4d4d4',
        },
        textInput: {
          backgroundColor: textInputBackgroundColor || 'white',
          fontSize: 16,
          fontWeight: 600,
          marginTop: 5,
          width: '100%',
          borderRadius: 200,
        },
        listView: {
          backgroundColor: textInputBackgroundColor || 'white',
          position: 'relative',
          top: 0,
          width: '100%',
          borderRadius: 10,
          shadowColor: 'd4d4d4',
          zIndex: 99,
        },
      }}
      onPress={(data, details = null) => {
        handlePress({
          latitude: details?.geometry.location.lat!,
          longitude: details?.geometry.location.lng!,
          address: data.description,
        });
      }}
      query={{
        key: googlePlacesApiKey,
        language: 'pt-BR',
      }}
      renderLeftButton={() => (
        <View className="h-6 w-6 items-center justify-center ">
          <Image source={icon ? icon : icons.search} className="h-6 w-6" resizeMode="contain" />
        </View>
      )}
      textInputProps={{
        placeholderTextColor: 'gray',
        placeholder: initialLocation ?? 'Para onde deseja ir?',
      }}
    />
  </View>
);

export default GoogleTextInput;
