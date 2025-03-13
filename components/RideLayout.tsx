import { router } from 'expo-router';
import { icons } from '../constants';
import React, { useRef } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Map from './Map';
import BottomSheet, { BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';

const RideLayout = ({
  title,
  children,
  snapPoints,
}: {
  title: string;
  children: React.ReactNode;
  snapPoints?: string[];
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);

  return (
    <GestureHandlerRootView>
      <View className="flex-1 bg-white">
        <View className="flex h-screen flex-col  bg-blue-500">
          <View className="absolute top-16 z-10 flex flex-row items-center justify-start px-5">
            <TouchableOpacity onPress={() => router.back()}>
              <View className="h-10 w-10 items-center justify-center rounded-full bg-white">
                <Image source={icons.backArrow} resizeMode="contain" className="h-6 w-6" />
              </View>
            </TouchableOpacity>
            <Text className="ml-5 font-JakartaSemiBold text-xl">{title || 'Go Back'}</Text>
          </View>
          <Map />
        </View>
        <BottomSheet
          keyboardBehavior="extend"
          ref={bottomSheetRef}
          snapPoints={snapPoints || ['40%', '85%']}
          index={0}>
          <BottomSheetView style={{ flex: 1, padding: 20 }}>{children}</BottomSheetView>
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
};

export default RideLayout;
