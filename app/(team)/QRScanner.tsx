import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

export default function ScanQRScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const onBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    console.log("QR FROM CAMERA:", data);
  };

  const pickImageFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (result.canceled) return;

    Alert.alert(
      "Gallery",
      "Image selected.\nSend this image to backend to decode QR."
    );
  };

  if (!permission) return <View className="flex-1 bg-black" />;

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-black px-6">
        <Text className="text-white text-center mb-4">
          Camera permission is required
        </Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text className="text-[#90717E] font-semibold">Grant permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {/* CAMERA + OVERLAY */}
      <View className="absolute inset-0">
        <CameraView
          className="absolute inset-0"
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={onBarcodeScanned}
        />
        <View className="absolute inset-0 bg-black/40" />
      </View>

      {/* UI */}
      <View className="flex-1 justify-between z-10">
        {/* TOP */}
        <View className="pt-14 px-5">
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={28} color="white" />
          </TouchableOpacity>

          <View className="self-center mt-6 bg-[#BFA5AE] px-5 py-2 rounded-full">
            <Text className="text-white text-sm">
              Scan QR code to join team.
            </Text>
          </View>
        </View>

        {/* SCAN FRAME */}
        <View className="flex-1 items-center justify-center">
          <View className="w-[260px] h-[260px] relative">
            <Corner position="tl" />
            <Corner position="tr" />
            <Corner position="bl" />
            <Corner position="br" />
            <View className="absolute top-1/2 left-5 right-5 h-[2px] bg-white/70" />
          </View>
        </View>

        {/* BOTTOM */}
        <View className="pb-10 items-center">
          <TouchableOpacity
            onPress={pickImageFromGallery}
            className="items-center"
          >
            <MaterialCommunityIcons
              name="image-outline"
              size={26}
              color="white"
            />
            <Text className="text-white text-xs mt-2">
              Choose image from gallery
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function Corner({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const base = "absolute w-10 h-10 border-white";
  const map = {
    tl: `${base} top-0 left-0 border-t-4 border-l-4 rounded-tl-2xl`,
    tr: `${base} top-0 right-0 border-t-4 border-r-4 rounded-tr-2xl`,
    bl: `${base} bottom-0 left-0 border-b-4 border-l-4 rounded-bl-2xl`,
    br: `${base} bottom-0 right-0 border-b-4 border-r-4 rounded-br-2xl`,
  };
  return <View className={map[position]} />;
}
