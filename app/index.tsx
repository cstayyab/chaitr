import React from "react";
import { Box } from "@/components/ui/box";
import { useState, useCallback, useEffect } from 'react';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Spinner } from "@/components/ui/spinner";

const AI_CHAT_USER = {
  _id: 2,
  name: 'Chaitr',
}

const STORAGE_KEY = 'chaitr_messages';

export default function Home() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(false);

  // Load messages from storage when component mounts
  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const savedMessages = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const saveMessages = async (newMessages: IMessage[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newMessages));
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  };

  const onSend = useCallback((newMessages: IMessage[] = []) => {
    const updatedMessages = GiftedChat.append(messages, newMessages);
    setMessages(updatedMessages);
    saveMessages(updatedMessages);
    
    const userMessage = newMessages[0].text;
    setLoading(true);

    axios
      .post('http://YOUR-IP-ADDRESS:3000/chat', { message: userMessage })
      .then(res => {
        const reply: IMessage = {
          _id: Date.now().toString(),
          text: res.data.reply,
          createdAt: new Date(),
          user: AI_CHAT_USER,
        };
        const messagesWithReply = GiftedChat.append(updatedMessages, [reply]);
        setMessages(messagesWithReply);
        saveMessages(messagesWithReply);
      })
      .catch(() => {
        const errorMessage: IMessage = {
          _id: Date.now().toString(),
          text: "Error: Couldn't connect to backend.",
          createdAt: new Date(),
          user: AI_CHAT_USER,
        };
        const messagesWithError = GiftedChat.append(updatedMessages, [errorMessage]);
        setMessages(messagesWithError);
        saveMessages(messagesWithError);
      })
      .finally(() => setLoading(false));
  }, [messages]);

  return (
    <Box className="flex-1 bg-transparent h-[100vh]">
      {loading && <Spinner size="large" color={'blue'} />}
      <GiftedChat
        messages={messages}
        onSend={msgs => onSend(msgs)}
        user={{ _id: 1 }}
        renderUsernameOnMessage
      />
    </Box>
  );
}