// app/(auth)/(flow)/register.tsx
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
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [retypePassword, setRetypePassword] = useState("");
  const [showRetypePassword, setShowRetypePassword] = useState(false);

  //Handlers
  const handleSignUp = () => {
    router.push({
      pathname: "/(auth)/(flow)/verify",
      params: { purpose: "register" },
    });
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
    </View>
  );
}
