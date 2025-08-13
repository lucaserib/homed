import { formatDate, formatTime } from 'lib/utils';
import { Image, Text, View } from 'react-native';
import { Ride } from 'types/type';

import { icons } from '../constants';

const RideCard = ({ ride }: { ride: Ride }) => {
  return (
    <View className="mb-3 flex flex-row items-center justify-center rounded-lg bg-white shadow-sm shadow-neutral-300">
      <View className="flex flex-col items-start justify-center p-3">
        <View className="flex flex-row items-center justify-between">
          <Image
            source={{
              uri: `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=400&center=lonlat:${ride.destination_longitude},${ride.destination_latitude}&zoom=14&apiKey=${process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY}`,
            }}
            className="h-[90px] w-[80px] rounded-lg"
          />

          <View className="mx-5 flex flex-1 flex-col gap-y-5">
            <View className="flex flex-row items-center gap-x-2">
              <Image source={icons.to} className="h-5 w-5" />
              <Text className="text-md font-JakartaMedium" numberOfLines={1}>
                {ride.origin_address}
              </Text>
            </View>

            <View className="flex flex-row items-center gap-x-2">
              <Image source={icons.point} className="h-5 w-5" />
              <Text className="text-md font-JakartaMedium" numberOfLines={1}>
                {ride.destination_address}
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-5 flex w-full flex-col items-start justify-center rounded-lg bg-general-500 p-3">
          <View className="mb-5 flex w-full flex-row items-center justify-between">
            <Text className="text-md font-JakartaMedium text-gray-500">Date & Time</Text>
            <Text className="text-md font-JakartaBold" numberOfLines={1}>
              {formatDate(ride.created_at)}, {formatTime(ride.ride_time)}
            </Text>
          </View>

          <View className="mb-5 flex w-full flex-row items-center justify-between">
            <Text className="text-md font-JakartaMedium text-gray-500">Driver</Text>
            <Text className="text-md font-JakartaBold">
              {ride.driver.first_name} {ride.driver.last_name}
            </Text>
          </View>

          <View className="mb-5 flex w-full flex-row items-center justify-between">
            <Text className="text-md font-JakartaMedium text-gray-500">Car Seats</Text>
            <Text className="text-md font-JakartaBold">{ride.driver.car_seats}</Text>
          </View>

          <View className="flex w-full flex-row items-center justify-between">
            <Text className="text-md font-JakartaMedium text-gray-500">Payment Status</Text>
            <Text
              className={`text-md font-JakartaBold capitalize ${ride.payment_status === 'paid' ? 'text-green-500' : 'text-red-500'}`}>
              {ride.payment_status}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default RideCard;
