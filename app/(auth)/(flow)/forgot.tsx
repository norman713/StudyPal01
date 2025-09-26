// app/(auth)/(flow)/register.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";

export const screenConfig = {
  backEnabled: true,
};

export default function ForgotPage() {
  //Hooks
  const { purpose } = useLocalSearchParams<{
    purpose?: "register" | "reset";
  }>();
  const router = useRouter();
  //States
  const [email, setEmail] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  const [modalVisible, setModalVisible] = useState(false);

  //Effects
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Handler
  const handleSendCode = () => {
    router.push({
      pathname: "/(auth)/(flow)/verify",
      params: { purpose: "reset" },
    });
  };

  return (
    <View className="gap-10">
      <Text className="text-[#90717E] font-PoppinsSemiBold text-[28px]">
        Forgot Password
      </Text>
      {/* Text input */}
      <View className="gap-7">
        <TextInput
          label="Enter your linked email"
          mode="outlined"
          value={email}
          onChangeText={(email) => setEmail(email)}
          theme={{
            roundness: 30,
          }}
        />
      </View>
      {/* Info text + countdown */}
      <Text className="text-[#90717E] font-PoppinsRegular text-[14px]">
        We will send you a password reset email. Please check your inbox and
        spam folder.
      </Text>
      <Button
        className="mt-6"
        mode="contained"
        contentStyle={{ height: 44 }}
        labelStyle={{ fontSize: 16, fontFamily: "PoppinsRegular" }}
        theme={{ roundness: 100 }}
        onPress={handleSendCode}
      >
        Send code
      </Button>
    </View>
  );
}
