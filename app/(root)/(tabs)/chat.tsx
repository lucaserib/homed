import React from 'react';
import { SafeAreaView, View, Text, ScrollView, Image } from 'react-native';
import { images } from '../../../constants';
import EmptyState from '../../../components/EmptyState';

const Chat = () => {
  return (
    <SafeAreaView className="h-full bg-gray-50" edges={['top', 'left', 'right']}>
      {/* Header */}
      <View className="border-b border-gray-200 bg-white px-6 py-5">
        <Text className="font-JakartaBold text-2xl text-gray-900">Chat</Text>
        <Text className="font-JakartaMedium text-sm text-gray-500 mt-1">
          Mensagens com médicos
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 40,
          paddingBottom: 100,
          flex: 1,
          justifyContent: 'center',
        }}>
        <EmptyState
          title="Nenhuma mensagem ainda"
          description="Suas conversas com médicos aparecerão aqui"
          image={images.message}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Chat;
