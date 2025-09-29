// app/(auth)/(flow)/forgot.tsx
import authApi from "@/api/authApi";
import Loading from "@/components/loading";
import ErrorModal from "@/components/modal/error";
import { isValidEmail } from "@/utils/validator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";

export const screenConfig = { backEnabled: true };

export default function ForgotPage() {
  const { purpose } = useLocalSearchParams<{
    purpose?: "register" | "reset";
  }>();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [message, setMessage] = useState({ title: "", description: "" });
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const openError = (title: string, description: string) => {
    setMessage({ title, description });
    setShowError(true);
  };

  const handleSendCode = async () => {
    // reset error modal
    setShowError(false);
    setMessage({ title: "", description: "" });

    const emailTrim = email.trim();

    // Validate
    if (!emailTrim) {
      openError("Error", "Please fill in email.");
      return;
    }
    if (!isValidEmail(emailTrim)) {
      openError("Error", "Invalid email format.");
      return;
    }

    // Call API
    setLoading(true);
    try {
      const res = await authApi.code("RESET_PASSWORD", emailTrim);
      if (!res.success) {
        openError(
          "Send code failed",
          res.message || "Failed to send reset code."
        );
        return;
      }

      await AsyncStorage.setItem("resetEmail", emailTrim);
      router.push({
        pathname: "/(auth)/(flow)/verify",
        params: { purpose: "reset", email: emailTrim },
      });
    } catch (err: any) {
      const apiMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to send reset code.";
      openError("Send code failed", apiMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="gap-10 flex-1">
      <Text className="text-[#90717E] font-PoppinsSemiBold text-[28px]">
        Forgot Password
      </Text>

      <View className="gap-7">
        <TextInput
          label="Enter your linked email"
          mode="outlined"
          value={email}
          onChangeText={setEmail}
          theme={{ roundness: 30 }}
        />
      </View>

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

      <ErrorModal
        visible={showError}
        title={message.title || "Error"}
        message={message.description}
        confirmText="OK"
        onConfirm={() => setShowError(false)}
      />
    </View>
  );
}
