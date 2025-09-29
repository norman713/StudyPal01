import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Slot, usePathname, useRouter } from "expo-router";
import { useEffect } from "react";
import {
  BackHandler,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

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

  useEffect(() => {
    if (!backEnabled) {
      const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
      return () => sub.remove();
    }
  }, [backEnabled]);

  const topOffset = height * 0.15;

  return (
    <LinearGradient
      colors={["#90717E", "#8C8C8C"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="h-full flex-1"
    >
      {/* Back button area */}
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

      {/* Panel trắng làm nền (absolute), không chặn touch */}
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          {
            top: topOffset, // đẩy xuống 15% chiều cao
            backgroundColor: "white",
            borderTopLeftRadius: 40,
            borderTopRightRadius: 40,
          },
        ]}
      />

      {/* Khu vực nội dung thực (full screen) + padding để “nằm trong” panel */}
      <View
        style={{
          flex: 1,
          paddingHorizontal: 48,
          paddingVertical: 40,
          marginTop: topOffset,
        }}
      >
        <Slot />
      </View>
    </LinearGradient>
  );
}
