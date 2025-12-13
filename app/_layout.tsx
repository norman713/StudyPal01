import { AuthProvider } from "@/context/auth";
import { NotificationProvider } from "@/context/notificationContext";
import { UserProvider } from "@/context/userContext";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import messaging from '@react-native-firebase/messaging';
import { Provider as PaperProvider } from "react-native-paper";
import { InAppNotificationProvider, useInAppNotification } from "@/context/inAppNotificationContext";
import { NotificationListener } from "@/components/notificationListener";
import { NotificationBanner } from "@/components/ui/notificationbanner";
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
      <UserProvider>
      <NotificationProvider>
      <InAppNotificationProvider>
      <PaperProvider>
        <NotificationListener />
        <Stack
          screenOptions={{ headerShown: false }}
          initialRouteName="(auth)/landing"
        >
          <Stack.Screen name="(auth)/landing" />
          <Stack.Screen name="(auth)/login" />
        </Stack>
        <NotificationBanner />
      </PaperProvider>
      </InAppNotificationProvider>
      </NotificationProvider>
      </UserProvider>
    </AuthProvider>
  );
}
