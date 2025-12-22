import memberApi from "@/api/memberApi";
import teamApi, { TeamPreviewResponse } from "@/api/teamApi";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import JoinTeamModal from "./components/joinTeam";

export default function ScanQRScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const insets = useSafeAreaInsets();

  const [preview, setPreview] = useState<TeamPreviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [teamCode, setTeamCode] = useState<string | null>(null);

  /* =======================
     REQUEST CAMERA PERMISSION
  ======================= */
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  /* =======================
     CAMERA SCAN
  ======================= */
  const onBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    try {
      setLoading(true);

      setTeamCode(data); // 👈 LƯU CODE Ở ĐÂY

      const res = await teamApi.getPreviewByCode(data);
      setPreview(res);
      setShowModal(true);
    } catch {
      Alert.alert("Invalid QR", "Team not found or QR expired");
      setScanned(false);
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     PICK IMAGE FROM GALLERY
  ======================= */
  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (result.canceled) return;

    const imageUri = result.assets[0].uri;
    console.log("IMAGE URI:", imageUri);

    Alert.alert("Gallery selected", "Send this image to backend to decode QR.");
  };

  /* =======================
     PERMISSION UI
  ======================= */
  if (!permission?.granted) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Camera permission required</Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text style={{ marginTop: 8, color: "#90717E" }}>
            Grant permission
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
  const handleJoinTeam = async () => {
    if (!teamCode) return;

    try {
      setLoading(true);

      const res = await memberApi.join(teamCode);

      Alert.alert("Success", res.message);

      setShowModal(false);
      setScanned(false);
      router.push("/(team)/search");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Cannot join team";

      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* CAMERA */}
      <CameraView
        style={{ flex: 1 }}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={onBarcodeScanned}
      />

      {/* ===== TOP BAR ===== */}
      <View
        style={{
          position: "absolute",
          top: insets.top + 12,
          left: 16,
          right: 16,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {/* BACK BUTTON */}
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="white" />
        </TouchableOpacity>

        {/* TITLE */}
        <View style={{ flex: 1, alignItems: "center", marginRight: 28 }}>
          <View
            style={{
              backgroundColor: "#BFA5AE",
              paddingHorizontal: 16,
              paddingVertical: 6,
              borderRadius: 20,
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 18,
                fontWeight: "500",
              }}
            >
              Scan QR to join team
            </Text>
          </View>
        </View>
      </View>

      {/* ===== BOTTOM ACTION ===== */}
      <View
        style={{
          position: "absolute",
          bottom: 40,
          alignSelf: "center",
        }}
      >
        <TouchableOpacity
          onPress={pickFromGallery}
          style={{ alignItems: "center" }}
        >
          <MaterialCommunityIcons
            name="image-outline"
            size={30}
            color="white"
          />
          <View style={{ width: 200 }}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                marginTop: 6,
                color: "white",
                fontSize: 18,
                textAlign: "center",
              }}
            >
              Choose from Gallery
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      {preview && (
        <JoinTeamModal
          visible={showModal}
          avatar={preview.avatarUrl ?? "https://via.placeholder.com/80"}
          teamName={preview.name}
          description={preview.description ?? ""}
          ownerName={preview.creatorName}
          ownerAvatar={
            preview.creatorAvatarUrl ?? "https://via.placeholder.com/40"
          }
          membersCount={preview.totalMembers}
          onJoin={handleJoinTeam}
          onClose={() => {
            setShowModal(false);
            setScanned(false);
          }}
        />
      )}
    </View>
  );
}
