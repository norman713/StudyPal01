// app/(auth)/(flow)/verify.tsx
import authApi from "@/api/authApi";
import Loading from "@/components/loading";
import ErrorModal from "@/components/modal/error";
import SuccessModal from "@/components/modal/success";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";

export const screenConfig = {
  backEnabled: true,
};

export default function VerifyPage() {
  //Hooks
  const { purpose, email } = useLocalSearchParams<{
    purpose?: "register" | "reset";
    email?: string;
  }>();
  const router = useRouter();

  //States
  const [code, setCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [modalVisible, setModalVisible] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

  /**
   * Handler
   */
  const handleSendCode = async () => {
    const codeTrim = code.trim();
    const emailTrim = (email || "").trim();

    if (!codeTrim) {
      setErrorMessage("Please enter the verification code");
      setErrorVisible(true);
      return;
    }
    if (!emailTrim) {
      setErrorMessage("Missing email. Please try again.");
      setErrorVisible(true);
      return;
    }

    setLoading(true);
    try {
      if (purpose === "register") {
        await authApi.verifyRegister(emailTrim, codeTrim);
      } else {
        const res = await authApi.verifyReset(emailTrim, codeTrim);
        if (!res.success) {
          setErrorMessage(res.message || "Verification failed");
          setErrorVisible(true);
          return;
        }
      }
      setModalVisible(true);
    } catch (e: any) {
      const apiMessage =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Verification failed";
      setErrorMessage(apiMessage);
      setErrorVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email || !email.trim()) {
      setErrorMessage("Missing email. Please try again.");
      setErrorVisible(true);
      return;
    }
    try {
      await authApi.code(
        purpose === "reset" ? "RESET_PASSWORD" : "REGISTER",
        email.trim()
      );
      setTimeLeft(300);
    } catch (e: any) {
      setErrorMessage(e?.response?.data?.message || "Failed to resend code.");
      setErrorVisible(true);
    }
  };

  const handleConfirmModal = () => {
    setModalVisible(false);
    if (purpose === "reset") {
      router.push({
        pathname: "/(auth)/(flow)/reset",
        params: { email },
      });
    } else {
      router.push("/(auth)/login");
    }
  };

  return (
    <View className="gap-10">
      <Text className="text-[#90717E] font-PoppinsSemiBold text-[28px]">
        Verification
      </Text>

      {/* Input */}
      <View className="gap-7">
        <TextInput
          label="Enter your verification code"
          mode="outlined"
          value={code}
          onChangeText={(code) => setCode(code)}
          theme={{ roundness: 30 }}
        />
      </View>

      {/* Countdown */}
      <Text className="text-[#90717E] font-PoppinsRegular text-[14px]">
        Please enter the verification code we just sent to your email address.
        {"\n"}This code expires in{" "}
        <Text className="font-PoppinsSemiBold text-[#90717E]">
          {formatTime(timeLeft)}
        </Text>
        .
      </Text>

      {/* Verify Button */}
      <Button
        className="mt-6"
        mode="contained"
        contentStyle={{ height: 44 }}
        labelStyle={{ fontSize: 16, fontFamily: "PoppinsRegular" }}
        theme={{ roundness: 100 }}
        onPress={handleSendCode}
        loading={loading}
      >
        Send code
      </Button>

      {/* Resend Link */}
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

      {loading && (
        <Modal transparent visible statusBarTranslucent animationType="fade">
          <View
            style={[
              StyleSheet.absoluteFillObject,
              {
                backgroundColor: "rgba(0,0,0,0.3)",
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
          >
            <Loading />
          </View>
        </Modal>
      )}

      {/* Error Modal */}
      <ErrorModal
        visible={errorVisible}
        title="Verification Failed"
        message={errorMessage}
        confirmText="Close"
        onConfirm={() => setErrorVisible(false)}
      />
    </View>
  );
}
