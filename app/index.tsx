import React, { useMemo } from "react";
import { Box } from "@/components/ui/box";
import { useState, useCallback, useEffect } from "react";
import { GiftedChat, IMessage } from "react-native-gifted-chat";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Spinner } from "@/components/ui/spinner";
import { SettingsIcon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { MESSAGES_STORAGE, SETTINGS_STORAGE } from "@/constants/Storage";
import { useStoredValue } from "@/hooks/useStoredValue";
import { ISettings } from "./settings";
import { Alert, AlertIcon, AlertText } from "@/components/ui/alert";
import { TouchableHighlight } from "react-native";
import { Link, useFocusEffect } from "expo-router";

const AI_CHAT_USER = {
  _id: 2,
  name: "Chaitr",
};

export default function Chat() {
  const {
    value: storedMessages,
    setValue: setStoredMessaged,
    loading: isLoadingStoredMessages,
  } = useStoredValue<IMessage[]>(MESSAGES_STORAGE, []);
  const {
    value: settings,
    loading: isLoadingSettings,
    forceFetch: refetchSettings,
  } = useStoredValue<ISettings>(SETTINGS_STORAGE);

  const [isTyping, setIsTyping] = useState(false);

  const messages = useMemo(() => {
    if (!isLoadingStoredMessages) {
      return storedMessages;
    }
  }, [storedMessages, isLoadingStoredMessages]);

  useFocusEffect(useCallback(refetchSettings, []));

  const saveMessages = useCallback(
    async (newMessages: IMessage[]) => {
      try {
        await setStoredMessaged(newMessages);
      } catch (error) {
        console.error("Error saving messages:", error);
      }
    },
    [setStoredMessaged]
  );

  const onSend = useCallback(
    async (newMessages: IMessage[] = []) => {
      const updatedMessages = GiftedChat.append(messages, newMessages);
      saveMessages(updatedMessages);

      const userMessage = newMessages[0].text;
      const endpoint = `http://${settings?.ipAddress}:${settings?.port}/chat`;
      console.log("Sending message to:", endpoint);
      console.log("User message:", userMessage);
      if (!settings?.ipAddress || !settings?.port) {
        const errorMessage: IMessage = {
          _id: Date.now().toString(),
          text: "Error: IP Address or Port is not set.",
          createdAt: new Date(),
          user: AI_CHAT_USER,
          system: true,
        };
        const messagesWithError = GiftedChat.append(updatedMessages, [
          errorMessage,
        ]);
        saveMessages(messagesWithError);
        return;
      }
      setIsTyping(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      axios
        .post(endpoint, {
          message: userMessage,
        })
        .then((res) => {
          if (res.data.reply) {
            const reply: IMessage = {
              _id: Date.now().toString(),
              text: res.data.reply,
              createdAt: new Date(),
              user: AI_CHAT_USER,
            };
            const messagesWithReply = GiftedChat.append(updatedMessages, [
              reply,
            ]);
            saveMessages(messagesWithReply);
          } else if (res.data.error) {
            const errorMessage: IMessage = {
              _id: Date.now().toString(),
              text: res.data.error,
              createdAt: new Date(),
              user: AI_CHAT_USER,
              system: true,
            };
            const messagesWithError = GiftedChat.append(updatedMessages, [
              errorMessage,
            ]);
            saveMessages(messagesWithError);
          }
        })
        .catch((err) => {
          console.error("Error sending message:", err);
          console.log(err);
          const errorMessage: IMessage = {
            _id: Date.now().toString(),
            text: "Error: Couldn't connect to backend.",
            createdAt: new Date(),
            user: AI_CHAT_USER,
            system: true,
          };
          const messagesWithError = GiftedChat.append(updatedMessages, [
            errorMessage,
          ]);
          saveMessages(messagesWithError);
        }).finally(() => {
          setIsTyping(false);
        })
    },
    [messages, settings]
  );

  if (!isLoadingSettings && (!settings?.ipAddress || !settings?.port)) {
    return (
      <Box className="flex-1 justify-center items-center">
        <Alert action="muted" variant="solid" focusable={true}>
          <AlertIcon as={SettingsIcon} />
          <AlertText>
            Please set the Backend IP Address and Port from Settings!
          </AlertText>
        </Alert>
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-white dark:bg-black">
      {isLoadingStoredMessages || isLoadingSettings ? (
        <Box className="flex-1 justify-center items-center">
          <Spinner />
        </Box>
      ) : (
        <GiftedChat
          messages={messages}
          onSend={(msgs) => onSend(msgs)}
          user={{ _id: 1 }}
          isTyping={isTyping}
          renderUsernameOnMessage
        />
      )}
    </Box>
  );
}
