import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { useColorScheme } from "@/components/useColorScheme";
import { Link, Slot } from "expo-router";
import { Stack } from "expo-router/stack";

import "../global.css";
import { StatusBar } from "expo-status-bar";
import { SettingsIcon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { TouchableHighlight } from "react-native";
import { HStack } from "@/components/ui/hstack";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

// export const unstable_settings = {
//   // Ensure that reloading on `/modal` keeps a back button present.
//   initialRouteName: "gluestack",
// };

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  const [styleLoaded, setStyleLoaded] = useState(false);
  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // useLayoutEffect(() => {
  //   setStyleLoaded(true);
  // }, [styleLoaded]);

  // if (!loaded || !styleLoaded) {
  //   return null;
  // }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <GluestackUIProvider mode={colorScheme === "dark" ? "dark" : "light"}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <StatusBar style={colorScheme === "dark" ? "dark" : "light"} />
        <Stack
          screenOptions={{
            headerShown: true,
            headerTitleAlign: "left",
            headerTintColor: colorScheme === "dark" ? "white" : "black",
            headerStyle: {
              backgroundColor: colorScheme === "dark" ? "black" : "white",
            },
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: "Chaitr",
              headerRight: () => {
                return (
                  <HStack className="gap-2">
                    <Link href={"/logs"}>
                      <Text>Logs</Text>
                    </Link> <Text>|</Text>
                    <Link href={"/settings"}>
                      <Text>Settings</Text>
                    </Link>
                  </HStack>
                );
              },
            }}
          />
          <Stack.Screen name="settings" options={{ title: "Settings" }} />
          <Stack.Screen name="logs" options={{ title: "Logs" }} />
        </Stack>
      </ThemeProvider>
    </GluestackUIProvider>
  );
}
