import CustomButton from 'components/CustomButton';
import { Link, router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Text, TouchableOpacity, SafeAreaView, View, Image } from 'react-native';
import Swiper from 'react-native-swiper';

import { onboarding } from '../../constants';

const Onboarding = () => {
  const swiperRef = useRef<Swiper>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isLastSlide = activeIndex === onboarding.length - 1;
  return (
    <SafeAreaView className="flex h-full items-center justify-between bg-white ">
      <TouchableOpacity
        onPress={() => {
          router.replace('/(auth)/sign-up');
        }}
        className="flex w-full items-end justify-end p-5">
        <Text className="text-md font-JakartaBold text-black">Pular</Text>
      </TouchableOpacity>
      <Swiper
        ref={swiperRef}
        loop={false}
        dot={<View className="mx-1 h-[4px] w-[32px] rounded-full bg-[#E2E8F0]" />}
        activeDot={<View className="W-[32px] mx-1 h-[4px] rounded-full bg-[#0286FF]" />}
        onIndexChanged={(index) => setActiveIndex(index)}>
        {onboarding.map((item) => (
          <View key={item.id} className="flex items-center justify-center p-5">
            <Image source={item.image} className="h-[300px] w-full " resizeMode="contain" />
            <View className=" mt-10 flex w-full flex-row items-center justify-center">
              <Text className="mx-10 text-center text-3xl font-bold text-black">{item.title}</Text>
            </View>
            <View>
              <Text className="text-md mx-10 mt-3 text-center font-JakartaSemiBold text-[#858585]">
                {item.description}
              </Text>
            </View>
          </View>
        ))}
      </Swiper>

      {isLastSlide ? (
        <View className="mb-4 w-11/12">
          <Text className="mb-4 text-center font-JakartaSemiBold text-lg">
            Escolha uma opção para continuar:
          </Text>

          <Link href={'/(auth)/sign-up' as any} asChild>
            <CustomButton
              title="Continuar como Paciente"
              className="mt-2"
              IconLeft={() => (
                <Image
                  source={require('../../assets/icons/patient.png')}
                  className="mr-2 h-5 w-5"
                  tintColor="white"
                />
              )}
            />
          </Link>

          <Link href={'/(auth)/doctor-sign-up' as any} asChild>
            <CustomButton
              title="Continuar como Médico"
              bgVariant="outline"
              textVariant="primary"
              className="mt-3"
              IconLeft={() => (
                <Image
                  source={require('../../assets/icons/doctor.png')}
                  className="mr-2 h-5 w-5"
                  tintColor="#0286FF"
                />
              )}
            />
          </Link>

          <Link href={'/(auth)/sign-in' as any} asChild>
            <CustomButton
              title="Já tenho uma conta"
              bgVariant="light"
              textVariant="primary"
              className="mt-3"
            />
          </Link>
        </View>
      ) : (
        <CustomButton
          title="Próximo"
          className="mb-4 mt-10 w-11/12"
          onPress={() => swiperRef.current?.scrollBy(1)}
        />
      )}
    </SafeAreaView>
  );
};

export default Onboarding;
