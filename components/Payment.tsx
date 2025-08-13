import { useAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { fetchAPI } from 'lib/fetch';
import React, { useState } from 'react';
import { Alert, Image, Text, View } from 'react-native';
import ReactNativeModal from 'react-native-modal';
import { useLocationStore } from 'store';
import { PaymentProps } from 'types/type';

import CustomButton from './CustomButton';

// import { useStripe } from '@stripe/stripe-react-native';

import { images } from '../constants';

const Payment = ({ fullName, email, amount, driverId, rideTime }: PaymentProps) => {
  // const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const { userId } = useAuth();
  const [success, setSuccess] = useState(false);
  const {
    userAddress,
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationLongitude,
    destinationAddress,
  } = useLocationStore();

  const initializePaymentSheet = async () => {
    const { error } = await initPaymentSheet({
      merchantDisplayName: 'Homed Inc.',
      intentConfiguration: {
        mode: {
          amount: parseInt(amount) * 100,
          currencyCode: 'BRL',
        },
        confirmHandler: async (paymentMethod, _, intentCreationCallback) => {
          const { paymentIntent, customer } = await fetchAPI('/(api)/(stripe)/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: fullName || email.split('@')[0],
              email,
              amount,
              paymentMethodId: paymentMethod.id,
            }),
          });

          if (paymentIntent.client_secret) {
            const { result } = await fetchAPI('/(api)/(stripe)/pay', {
              method: 'POST',
              headers: {
                'Content-Type': 'applications/json',
              },
              body: JSON.stringify({
                payment_method_id: paymentMethod.id,
                payment_intent_id: paymentIntent.id,
                customer_id: customer,
              }),
            });

            if (result.client_secret) {
              await fetchAPI('/(api)/ride/create', {
                method: 'POST',
                headers: {
                  'Content-Type': 'applications/json',
                },
                body: JSON.stringify({
                  origin_address: userAddress,
                  destination_address: destinationAddress,
                  origin_latitude: userLatitude,
                  origin_longitude: userLongitude,
                  destination_latitude: destinationLatitude,
                  destination_longitude: destinationLongitude,
                  ride_time: rideTime.toFixed(0),
                  fare_price: parseInt(amount) * 100,
                  payment_status: 'paid',
                  driver_id: driverId,
                  user_id: userId,
                }),
              });

              intentCreationCallback({
                clientSecret: result.client_secret,
              });
            }
          }
        },
      },

      returnURL: 'myapp"//book-ride',
    });

    if (error) {
      console.log(error);
    }
  };

  const openPaymentSheet = async () => {
    await initializePaymentSheet();
    const { error } = await presentPaymentSheet();

    if (error) {
      Alert.alert(`Error code: ${error.code}`, error.message);
    } else {
      setSuccess(true);
    }
  };

  return (
    <>
      <CustomButton title="Confirmar Corrida" className="my-10" onPress={openPaymentSheet} />

      <ReactNativeModal isVisible={success} onBackdropPress={() => setSuccess(false)}>
        <View className="flex flex-col items-center justify-center rounded-2xl bg-white p-7">
          <Image source={images.check} className="mt-5 h-28 w-28" />
          <Text className="mt-5 text-center font-JakartaBold text-2xl">
            Pedido de corrida realizado com sucesso
          </Text>
          <Text className="text-md mt-3 text-center font-JakartaMedium text-general-200">
            Seu pedido de corrida foi enviado. Boa viagem!
          </Text>

          <CustomButton
            title="Voltar para tela inicial"
            onPress={() => {
              setSuccess(false);
              router.push('/(root)/(tabs)/home');
            }}
            className="mt-5"
          />
        </View>
      </ReactNativeModal>
    </>
  );
};
export default Payment;
