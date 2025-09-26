// app/(auth)/(flow)/register.tsx
import SuccessModal from "@/components/modal/success";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";

export const screenConfig = {
  backEnabled: true,
};

export default function VerifyPage() {
  //Hooks
  const { purpose } = useLocalSearchParams<{
    purpose?: "register" | "reset";
  }>();
  const router = useRouter();
  //States
  const [code, setCode] = useState("");
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

  // Format mm:ss
  const formatTime = (sec: number) => {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Handler
  const handleSendCode = () => {
    setModalVisible(true);
  };
  const handleResendCode = () => {
    setTimeLeft(300);
  };
  const handleConfirmModal = () => {
    setModalVisible(false);

    if (purpose === "reset") {
      router.push("/(auth)/(flow)/reset");
    } else {
      router.push("/(auth)/login");
    }
  };

  return (
    <View className="gap-10">
      <Text className="text-[#90717E] font-PoppinsSemiBold text-[28px]">
        Verification
      </Text>
      {/* Text input */}
      <View className="gap-7">
        <TextInput
          label="Enter your verification code"
          mode="outlined"
          value={code}
          onChangeText={(code) => setCode(code)}
          theme={{
            roundness: 30,
          }}
        />
      </View>
      {/* Info text + countdown */}
      <Text className="text-[#90717E] font-PoppinsRegular text-[14px]">
        Please enter the verification code we just sent to your email address.
        {"\n"}This code expires in{" "}
        <Text className="font-PoppinsSemiBold text-[#90717E">
          {formatTime(timeLeft)}
        </Text>
        .
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

      <View className="flex-row justify-center mt-4">
        <Text className="text-[16px] text-[#000000] font-PoppinsRegular">
          Didn’t receive a code?{" "}
        </Text>
        <Pressable onPress={handleResendCode}>
          <Text className="text-[16px] text-[#90717E] font-PoppinsSemiBold">
            Resend here
          </Text>
        </Pressable>
      </View>

      {/* Success Modal */}
      <SuccessModal
        visible={modalVisible}
        title="Success!"
        message={
          purpose === "reset"
            ? "Code is true. Now you can reset your password."
            : "Code is true. Now you can log in to your account."
        }
        confirmText="Confirm"
        onConfirm={handleConfirmModal}
      />
    </View>
  );
}
