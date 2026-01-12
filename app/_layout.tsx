import { AuthProvider } from "@/context/auth";
import { UnreadNotificationProvider } from "@/context/unreadNotificationContext";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Provider as PaperProvider } from "react-native-paper";
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    PoppinsBold: require("../assets/fonts/Poppins-Bold.ttf"),
    PoppinsSemiBold: require("../assets/fonts/Poppins-SemiBold.ttf"),
    PoppinsRegular: require("../assets/fonts/Poppins-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <UnreadNotificationProvider>
      <PaperProvider>
        <Stack
          screenOptions={{ headerShown: false }}
          initialRouteName="(auth)/landing"
        >
          <Stack.Screen name="(auth)/landing" />
          <Stack.Screen name="(auth)/login" />
        </Stack>
      </PaperProvider>
      </UnreadNotificationProvider>
    </AuthProvider>
  );
}
