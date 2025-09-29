import Loading from "@/components/loading";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Image, View } from "react-native";
import "../../global.css";

export default function LandingPage() {
  const router = useRouter();
  const imageSource = require("../../assets/images/background.png");

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/(auth)/login");
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={["#90717E", "#8C8C8C"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1 justify-center items-center"
    >
      {/* Center content */}
      <Image
        source={imageSource}
        style={{ width: 300, height: 300 }}
        resizeMode="contain"
      />
      <View className="absolute inset-0 items-center justify-center pointer-events-none">
        <Loading /* size={160} */ />
      </View>
    </LinearGradient>
  );
}
