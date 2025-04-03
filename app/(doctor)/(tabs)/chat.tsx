import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { fetchAPI } from '../../../lib/fetch';
import { icons } from '../../../constants';
import { styled } from 'nativewind';
import type { ChatRoom, Message } from '../../../types/consultation';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledScrollView = styled(ScrollView);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledImage = styled(Image);
const StyledTextInput = styled(TextInput);
const StyledKeyboardAvoidingView = styled(KeyboardAvoidingView);

// Função para formatação de datas
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Ontem';
  } else if (diffDays < 7) {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[date.getDay()];
  } else {
    return date.toLocaleDateString();
  }
};

// Componente para cada sala de chat
const ChatRoomItem: React.FC<{
  chatRoom: ChatRoom;
  isActive: boolean;
  onSelect: () => void;
}> = ({ chatRoom, isActive, onSelect }) => {
  // Encontrar o participante que não é o médico (paciente)
  const patientParticipant = chatRoom.participants?.[0] || { name: 'Paciente', id: 'unknown' };

  return (
    <StyledTouchableOpacity
      onPress={onSelect}
      className={`mb-2 flex-row items-center rounded-xl p-3 ${
        isActive ? 'bg-primary-100' : 'bg-white'
      }`}>
      <StyledView className="h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gray-200">
        {patientParticipant.image ? (
          <StyledImage source={{ uri: patientParticipant.image }} className="h-full w-full" />
        ) : (
          <StyledText className="font-JakartaExtraBold text-xl text-gray-400">
            {patientParticipant.name.charAt(0).toUpperCase()}
          </StyledText>
        )}
      </StyledView>

      <StyledView className="ml-3 flex-1">
        <StyledView className="flex-row items-center justify-between">
          <StyledText className="font-JakartaSemiBold">{patientParticipant.name}</StyledText>
          <StyledText className="text-xs text-gray-500">
            {chatRoom.lastMessageTime ? formatDate(chatRoom.lastMessageTime) : ''}
          </StyledText>
        </StyledView>

        <StyledText
          numberOfLines={1}
          className={`text-sm ${chatRoom.unreadCount > 0 ? 'font-JakartaSemiBold' : 'text-gray-500'}`}>
          {chatRoom.lastMessage || 'Nenhuma mensagem'}
        </StyledText>
      </StyledView>

      {chatRoom.unreadCount > 0 && (
        <StyledView className="ml-2 h-6 w-6 items-center justify-center rounded-full bg-primary-500">
          <StyledText className="text-xs font-bold text-white">{chatRoom.unreadCount}</StyledText>
        </StyledView>
      )}
    </StyledTouchableOpacity>
  );
};

// Componente para exibir uma mensagem
const ChatMessage: React.FC<{
  message: Message;
  isCurrentUser: boolean;
}> = ({ message, isCurrentUser }) => {
  return (
    <StyledView
      className={`mb-3 max-w-[80%] rounded-2xl p-3 ${
        isCurrentUser
          ? 'self-end rounded-tr-none bg-primary-500'
          : 'self-start rounded-tl-none bg-gray-200'
      }`}>
      <StyledText className={`font-Jakarta ${isCurrentUser ? 'text-white' : 'text-gray-800'}`}>
        {message.content}
      </StyledText>
      <StyledText
        className={`mt-1 text-right text-xs ${
          isCurrentUser ? 'text-primary-100' : 'text-gray-500'
        }`}>
        {formatDate(message.timestamp)}
      </StyledText>
    </StyledView>
  );
};

// Lista de salas de chat
const ChatList: React.FC<{
  chatRooms: ChatRoom[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  loading: boolean;
}> = ({ chatRooms, activeChatId, onSelectChat, loading }) => {
  if (loading) {
    return (
      <StyledView className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0286FF" />
      </StyledView>
    );
  }

  if (chatRooms.length === 0) {
    return (
      <StyledView className="flex-1 items-center justify-center p-5">
        <StyledText className="text-center font-JakartaSemiBold text-gray-500">
          Você não tem conversas ainda.
        </StyledText>
      </StyledView>
    );
  }

  return (
    <StyledScrollView className="flex-1">
      {chatRooms.map((chatRoom) => (
        <ChatRoomItem
          key={chatRoom.id}
          chatRoom={chatRoom}
          isActive={chatRoom.id === activeChatId}
          onSelect={() => onSelectChat(chatRoom.id)}
        />
      ))}
    </StyledScrollView>
  );
};

// Área de chat ativa
const ActiveChatArea: React.FC<{
  activeChat: ChatRoom | null;
  messages: Message[];
  newMessage: string;
  setNewMessage: (text: string) => void;
  handleSendMessage: () => void;
  loading: boolean;
  currentUserId: string;
  onBack: () => void;
}> = ({
  activeChat,
  messages,
  newMessage,
  setNewMessage,
  handleSendMessage,
  loading,
  currentUserId,
  onBack,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Scroll para o final quando mensagens mudam
    if (scrollViewRef.current && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  if (!activeChat) {
    return (
      <StyledView className="flex-1 items-center justify-center bg-general-100">
        <StyledText className="text-center font-JakartaSemiBold text-gray-500">
          Selecione uma conversa para começar o chat
        </StyledText>
      </StyledView>
    );
  }

  if (loading) {
    return (
      <StyledView className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0286FF" />
      </StyledView>
    );
  }

  // Encontrar o participante que não é o médico (paciente)
  const patientParticipant = activeChat.participants?.[0] || { name: 'Paciente', id: 'unknown' };

  return (
    <StyledKeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-general-100">
      {/* Header */}
      <StyledView className="flex-row items-center border-b border-gray-200 bg-white p-3">
        <StyledTouchableOpacity onPress={onBack} className="mr-2">
          <StyledImage source={icons.backArrow} className="h-6 w-6" />
        </StyledTouchableOpacity>

        <StyledView className="h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-200">
          {patientParticipant.image ? (
            <StyledImage source={{ uri: patientParticipant.image }} className="h-full w-full" />
          ) : (
            <StyledText className="font-JakartaExtraBold text-lg text-gray-400">
              {patientParticipant.name.charAt(0).toUpperCase()}
            </StyledText>
          )}
        </StyledView>
        <StyledText className="ml-3 font-JakartaSemiBold text-lg">
          {patientParticipant.name}
        </StyledText>
      </StyledView>

      {/* Chat Messages */}
      <StyledScrollView
        ref={scrollViewRef}
        className="flex-1 p-4"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled">
        {messages.length === 0 ? (
          <StyledView className="flex-1 items-center justify-center">
            <StyledText className="text-center font-JakartaSemiBold text-gray-500">
              Nenhuma mensagem ainda. Comece a conversa!
            </StyledText>
          </StyledView>
        ) : (
          messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isCurrentUser={message.senderId === currentUserId}
            />
          ))
        )}
      </StyledScrollView>

      {/* Input Area */}
      <StyledView className="flex-row items-center border-t border-gray-200 bg-white p-2">
        <StyledTextInput
          className="mr-2 flex-1 rounded-full bg-gray-100 px-4 py-2 font-Jakarta"
          placeholder="Digite sua mensagem..."
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
        />
        <StyledTouchableOpacity
          onPress={handleSendMessage}
          disabled={!newMessage.trim()}
          className={`h-10 w-10 items-center justify-center rounded-full ${
            newMessage.trim() ? 'bg-primary-500' : 'bg-gray-300'
          }`}>
          <StyledImage source={icons.send} className="h-5 w-5" tintColor="white" />
        </StyledTouchableOpacity>
      </StyledView>
    </StyledKeyboardAvoidingView>
  );
};

// Tela principal de chat
const ChatScreen: React.FC = () => {
  const { user } = useUser();
  const params = useLocalSearchParams<{ consultationId?: string }>();
  const [loading, setLoading] = useState(true);
  const [chatRoomsData, setChatRoomsData] = useState<ChatRoom[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChat, setActiveChat] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Carregar salas de chat
  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const response = await fetchAPI(`/(api)/chat/doctor/${user?.id}`);
        if (response?.data) {
          setChatRoomsData(response.data);

          // Se houver um consultationId nos parâmetros, tente encontrar o chat correspondente
          if (params.consultationId) {
            const chat = response.data.find(
              (room: ChatRoom) => room.consultationId === params.consultationId
            );
            if (chat) {
              setActiveChatId(chat.id);
              setActiveChat(chat);
              setIsChatOpen(true);
              fetchMessages(chat.id);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching chat rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatRooms();
  }, [user?.id, params.consultationId]);

  // Carregar mensagens de uma sala específica
  const fetchMessages = async (chatId: string) => {
    try {
      setLoadingMessages(true);
      const response = await fetchAPI(`/(api)/chat/${chatId}/messages`);
      if (response?.data) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Selecionar uma sala de chat
  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    const selected = chatRoomsData.find((room) => room.id === chatId);
    if (selected) {
      setActiveChat(selected);
      fetchMessages(chatId);
      setIsChatOpen(true);
    }
  };

  // Voltar para a lista de chats
  const handleBackToList = () => {
    setIsChatOpen(false);
  };

  // Enviar mensagem
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChatId || !user?.id) return;

    try {
      const messageData = {
        chatRoomId: activeChatId,
        senderId: user.id,
        content: newMessage.trim(),
      };

      const response = await fetchAPI('/(api)/chat/message', {
        method: 'POST',
        body: JSON.stringify(messageData),
      });

      if (response?.data) {
        setMessages((prev) => [...prev, response.data]);
        setNewMessage('');

        // Atualizar o chatRoom com a última mensagem
        setChatRoomsData((prev) =>
          prev.map((room) => {
            if (room.id === activeChatId) {
              return {
                ...room,
                lastMessage: newMessage.trim(),
                lastMessageTime: new Date().toISOString(),
                unreadCount: 0,
              };
            }
            return room;
          })
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <StyledSafeAreaView className="flex-1 bg-general-500">
      {isChatOpen && Platform.OS === 'web' ? (
        <StyledView className="flex-1 flex-row">
          <StyledView className="w-1/3 border-r border-gray-200">
            <StyledView className="border-b border-gray-200 p-4">
              <StyledText className="font-JakartaBold text-xl">Mensagens</StyledText>
            </StyledView>
            <ChatList
              chatRooms={chatRoomsData}
              activeChatId={activeChatId}
              onSelectChat={handleSelectChat}
              loading={loading}
            />
          </StyledView>
          <StyledView className="flex-1">
            <ActiveChatArea
              activeChat={activeChat}
              messages={messages}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              handleSendMessage={handleSendMessage}
              loading={loadingMessages}
              currentUserId={user?.id || ''}
              onBack={handleBackToList}
            />
          </StyledView>
        </StyledView>
      ) : isChatOpen ? (
        <ActiveChatArea
          activeChat={activeChat}
          messages={messages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          handleSendMessage={handleSendMessage}
          loading={loadingMessages}
          currentUserId={user?.id || ''}
          onBack={handleBackToList}
        />
      ) : (
        <StyledView className="flex-1">
          <StyledView className="border-b border-gray-200 bg-white p-4">
            <StyledText className="font-JakartaBold text-xl">Mensagens</StyledText>
          </StyledView>
          <ChatList
            chatRooms={chatRoomsData}
            activeChatId={activeChatId}
            onSelectChat={handleSelectChat}
            loading={loading}
          />
        </StyledView>
      )}
    </StyledSafeAreaView>
  );
};

export default ChatScreen;
