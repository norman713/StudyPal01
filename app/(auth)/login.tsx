import { useState } from "react";
import { Image, Text, View } from "react-native";
import { TextInput } from "react-native-paper";
import "../../global.css";
export default function LoginPage() {
  // Const
  const imageSource = require("../../assets/images/Reading.png");

  //States
  const [email, setEmail] = useState("");

  return (
    <View className="bg-[#90717E] h-full">
      {/* Top section */}
      <View className="h-[30%] justify-center">
        <Text className="text-white text-[51px] font-PoppinsSemiBold">
          Hello !
        </Text>
        <Text className=" text-white font-PoppinsRegular text-[16px]">
          Welcome to StudyPal
        </Text>
      </View>

      {/* Bottom section */}
      <View className="bg-white flex-1 rounded-t-[50px] p-6 ">
        <Image source={imageSource} />
        <Text className="text-[#90717E] font-PoppinsSemiBold text-[28px]">
          Login
        </Text>
        <TextInput
          mode="outlined"
          label="Email"
          value={email}
          onChangeText={(email) => setEmail(email)}
        />
      </View>
    </View>
  );
}
