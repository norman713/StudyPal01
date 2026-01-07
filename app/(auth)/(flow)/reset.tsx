// app/(auth)/(flow)/reset.tsx
import authApi from "@/api/authApi";
import Loading from "@/components/loading";
import ErrorModal from "@/components/modal/error";
import SuccessModal from "@/components/modal/success";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";

export const screenConfig = {
  backEnabled: true,
};

export default function ResetPage() {
  //Hooks
  const router = useRouter();
  const { email: emailParam } = useLocalSearchParams<{ email?: string }>();

  const [email, setEmail] = useState(emailParam ?? "");

  //States

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [retypePassword, setRetypePassword] = useState("");
  const [showRetypePassword, setShowRetypePassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [successVisible, setSuccessVisible] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // lấy email từ AsyncStorage
  useEffect(() => {
    // Nếu đã có email từ route → dùng luôn
    if (emailParam) {
      setEmail(emailParam);
      return;
    }

    // Fallback cho flow forgot password
    const loadEmail = async () => {
      const resetEmail = await AsyncStorage.getItem("resetEmail");
      if (resetEmail) setEmail(resetEmail);
    };

    loadEmail();
  }, [emailParam]);

  //Handlers
  const handleResetPassword = async () => {
    if (loading) return;

    const emailTrim = (email || "").trim();
    const passTrim = password.trim();
    const confirmTrim = retypePassword.trim();

    // Validate cơ bản
    if (!emailTrim) {
      setErrorMessage("Missing email. Please verify again.");
      setErrorVisible(true);
      return;
    }
    if (!passTrim) {
      setErrorMessage("Please enter new password.");
      setErrorVisible(true);
      return;
    }
    if (passTrim !== confirmTrim) {
      setErrorMessage("Passwords do not match.");
      setErrorVisible(true);
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.reset(emailTrim, passTrim);
      if (!res.success) {
        setErrorMessage(res.message || "Failed to reset password.");
        setErrorVisible(true);
        return;
      }
      setSuccessVisible(true);
    } catch (e: any) {
      const apiMessage =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Failed to reset password.";
      setErrorMessage(apiMessage);
      setErrorVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSuccess = () => {
    setSuccessVisible(false);
    router.push("/(auth)/login");
  };

  return (
    <View className="gap-10">
      <Text className="text-[#90717E] font-PoppinsSemiBold text-[28px]">
        Reset password
      </Text>

      {/* Text input */}
      <View className="gap-7">
        <TextInput
          mode="outlined"
          label="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          right={
            <TextInput.Icon
              icon={showPassword ? "eye" : "eye-off"}
              onPress={() => setShowPassword(!showPassword)}
            />
          }
          theme={{ roundness: 30 }}
        />
        <TextInput
          mode="outlined"
          label="Retype your password"
          value={retypePassword}
          onChangeText={setRetypePassword}
          secureTextEntry={!showRetypePassword}
          right={
            <TextInput.Icon
              icon={showRetypePassword ? "eye" : "eye-off"}
              onPress={() => setShowRetypePassword(!showRetypePassword)}
            />
          }
          theme={{ roundness: 30 }}
        />
      </View>

      <Button
        className="mt-6"
        mode="contained"
        buttonColor="#90717E"
        contentStyle={{ height: 44 }}
        labelStyle={{ fontSize: 16, fontFamily: "PoppinsRegular" }}
        theme={{ roundness: 100 }}
        onPress={handleResetPassword}
        loading={loading}
      >
        Reset Password
      </Button>

      {/* Success Modal */}
      <SuccessModal
        visible={successVisible}
        title="Success!"
        message="Your password has been reset successfully. Now you can log in with your new password."
        confirmText="Confirm"
        onConfirm={handleConfirmSuccess}
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
        title="Reset Failed"
        message={errorMessage}
        confirmText="Close"
        onConfirm={() => setErrorVisible(false)}
      />
    </View>
  );
}
