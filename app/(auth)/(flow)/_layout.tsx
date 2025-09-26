// app/(auth)/(flow)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Slot, usePathname, useRouter } from "expo-router";
import { useEffect } from "react";
import { BackHandler, Dimensions, TouchableOpacity, View } from "react-native";

// import static để Metro bundler biết
import { screenConfig as registerConfig } from "./register";
import { screenConfig as verifyConfig } from "./verify";

const screenConfigMap: Record<string, { backEnabled: boolean }> = {
  register: registerConfig,
  verify: verifyConfig,
};

export default function FlowLayout() {
  const { height } = Dimensions.get("window");
  const router = useRouter();
  const pathname = usePathname();

  const screenName = pathname.split("/").pop() || "";
  const { backEnabled = true } = screenConfigMap[screenName] || {};

  // Block hardware back nếu backEnabled = false
  useEffect(() => {
    if (!backEnabled) {
      const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
      return () => sub.remove();
    }
  }, [backEnabled]);

  return (
    <LinearGradient
      colors={["#90717E", "#8C8C8C"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="h-full"
    >
      <View
        style={{
          height: 30,
          justifyContent: "center",
          paddingLeft: 10,
          marginTop: 20,
        }}
      >
        {backEnabled && (
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={30} color="white" />
          </TouchableOpacity>
        )}
      </View>

      <View
        style={{
          flex: 1,
          backgroundColor: "white",
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
          paddingHorizontal: 48,
          paddingVertical: 40,
          marginTop: height * 0.15,
        }}
      >
        <Slot />
      </View>
    </LinearGradient>
  );
}
