// app/(auth)/(flow)/register.tsx
import SuccessModal from "@/components/modal/success";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";

export const screenConfig = {
  backEnabled: true,
};

export default function RegisterPage() {
  //Hooks
  const router = useRouter();
  //States
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [retypePassword, setRetypePassword] = useState("");
  const [showRetypePassword, setShowRetypePassword] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  //Handlers
  const handleResetPassword = () => {
    setModalVisible(true);
  };

  const handleConfirmModal = () => {
    setModalVisible(false);
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
          theme={{
            roundness: 30,
          }}
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
          theme={{
            roundness: 30,
          }}
        />
      </View>
      <Button
        className="mt-6"
        mode="contained"
        contentStyle={{ height: 44 }}
        labelStyle={{ fontSize: 16, fontFamily: "PoppinsRegular" }}
        theme={{ roundness: 100 }}
        onPress={handleResetPassword}
      >
        Reset Password
      </Button>
      {/* Success Modal */}
      <SuccessModal
        visible={modalVisible}
        title="Success!"
        message="Your password has been reset successfully. Now you can log in with your new password."
        confirmText="Confirm"
        onConfirm={handleConfirmModal}
      />
    </View>
  );
}
