// app/(auth)/(flow)/register.tsx
import authApi from "@/api/authApi";
import Loading from "@/components/loading";
import ErrorModal from "@/components/modal/error";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";

export const screenConfig = {
  backEnabled: true,
};

const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{3,}$/;
export default function RegisterPage() {
  //Hooks
  const router = useRouter();

  //States
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [retypePassword, setRetypePassword] = useState("");
  const [showRetypePassword, setShowRetypePassword] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const openError = (msg: string) => {
    setErrorMessage(msg);
    setShowError(true);
  };
  //Handlers
  const handleSignUp = async () => {
    // reset modal
    setShowError(false);
    setErrorMessage("");

    if (
      !username.trim() ||
      !email.trim() ||
      !password.trim() ||
      !retypePassword.trim()
    ) {
      setErrorMessage("Please fill all fields");
      setShowError(true);
      return;
    }

    if (password !== retypePassword) {
      setErrorMessage("Passwords do not match");
      setShowError(true);
      return;
    }
    if (!PASSWORD_RULE.test(password) || !PASSWORD_RULE.test(retypePassword)) {
      openError(
        "Password must be at least 3 characters long and contain both letters and numbers."
      );
      return;
    }

    setLoading(true);
    try {
      await authApi.register(username.trim(), email.trim(), password);
      router.push({
        pathname: "/(auth)/(flow)/verify",
        params: {
          purpose: "register",
          email: email.trim(),
          name: username.trim(),
        },
      });
    } catch (e: any) {
      setErrorMessage(e?.response?.data?.message || "Registration failed");
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="gap-10">
      <Text className="text-[#90717E] font-PoppinsSemiBold text-[28px]">
        Sign up
      </Text>
      {/* Text input */}
      <View className="gap-7">
        <TextInput
          label="Enter your username"
          mode="outlined"
          value={username}
          onChangeText={(username) => setUsername(username)}
          theme={{
            roundness: 30,
          }}
        />
        <TextInput
          label="Enter your email"
          mode="outlined"
          value={email}
          onChangeText={(email) => setEmail(email)}
          theme={{
            roundness: 30,
          }}
        />
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
        onPress={handleSignUp}
      >
        Sign up
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
        title="Register Failed"
        message={errorMessage}
        confirmText="Cancel"
        onConfirm={() => setShowError(false)}
      />
    </View>
  );
}
