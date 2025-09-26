import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import "../../global.css";
export default function LoginPage() {
  // Const
  const imageSource = require("../../assets/images/Reading.png");
  const ggIcon = require("../../assets/images/GoogleIcon.png");

  //Hooks
  const router = useRouter();

  //States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Handlers
  const handleForgotPassword = () => {
    router.push("/(auth)/(flow)/forgot");
  };

  const handleSignUp = () => {
    router.push("/(auth)/(flow)/register");
  };

  return (
    <LinearGradient
      colors={["#90717E", "#8C8C8C"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="bg-[#90717E] h-full"
    >
      {/* Top section */}
      <View className="h-[35%] justify-center px-14 ">
        <Text className="text-white text-[51px] font-PoppinsSemiBold leading-[55px]">
          Hello !
        </Text>
        <Text className=" text-white font-PoppinsRegular text-[16px]">
          Welcome to StudyPal
        </Text>
      </View>

      {/* Image section */}
      <View className="absolute top-[25%] left-[45%] z-10">
        <Image
          source={imageSource}
          className="w-50 h-50"
          resizeMode="contain"
        />
      </View>

      {/* Bottom section */}
      <View className="bg-white flex-1 rounded-t-[50px] px-14 py-10 ">
        <Text className="text-[#90717E] font-PoppinsSemiBold text-[28px] mb-8">
          Login
        </Text>

        {/* Enter login input */}
        <View className="gap-7">
          <TextInput
            mode="outlined"
            label="Enter email"
            value={email}
            onChangeText={(email) => setEmail(email)}
            theme={{
              roundness: 30,
            }}
          />
          <TextInput
            mode="outlined"
            label="Enter password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            right={
              <TextInput.Icon
                icon={showPassword ? "eye-off" : "eye"}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            theme={{
              roundness: 30,
            }}
          />
        </View>
        <Pressable onPress={handleForgotPassword}>
          <Text className="font-PoppinsSemiBold text-[#90717E] text-right mt-7 text-[16px]">
            Forgot Password
          </Text>
        </Pressable>
        {/* Button section */}
        <View className="gap-2 py-6">
          <Button
            mode="contained"
            contentStyle={{ height: 44 }}
            labelStyle={{ fontSize: 16, fontFamily: "PoppinsRegular" }}
            theme={{ roundness: 100 }}
            onPress={() => console.log("Pressed")}
          >
            Login
          </Button>

          {/* Divider */}
          <View className="flex-row items-center px-2">
            <View className="flex-1 h-[1px] bg-[#49454F]" />
            <Text className=" text-[#49454F] font-PoppinsRegular">
              Or login with
            </Text>
            <View className="flex-1 h-[1px] bg-[#49454F]" />
          </View>

          <Button
            mode="outlined"
            icon={() => (
              <Image
                source={ggIcon}
                style={{ width: 18, height: 18, marginRight: 10 }}
              />
            )}
            contentStyle={{ height: 44 }}
            labelStyle={{
              fontSize: 16,
              fontFamily: "PoppinsRegular",
              color: "#0F0C0D",
            }}
            theme={{ roundness: 100 }}
            onPress={() => console.log("Pressed")}
          >
            Login with Google
          </Button>
        </View>

        {/* Sign up section */}
        <View className="flex-row justify-center mt-4">
          <Text className="text-[16px] text-[#000000] font-PoppinsRegular">
            Don’t have an account?{" "}
          </Text>
          <Pressable onPress={handleSignUp}>
            <Text className="text-[16px] text-[#90717E] font-PoppinsSemiBold">
              Sign up here
            </Text>
          </Pressable>
        </View>
      </View>
    </LinearGradient>
  );
}
