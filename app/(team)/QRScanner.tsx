import { decodeQRFromImage } from "@/api/decodeApi";
import memberApi from "@/api/memberApi";
import teamApi, { TeamPreviewResponse } from "@/api/teamApi";
import ErrorModal from "@/components/modal/error";
import SuccessModal from "@/components/modal/success";
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

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

    try {
      setLoading(true);

      const asset = result.assets[0];

      const { teamCode } = await decodeQRFromImage({
        uri: asset.uri,
        fileName: asset.fileName ?? undefined,
        mimeType: asset.mimeType ?? undefined,
      });

      setTeamCode(teamCode);

      const preview = await teamApi.getPreviewByCode(teamCode);
      setPreview(preview);
      setShowModal(true);
    } catch (err) {
      console.error(err);
      Alert.alert("Invalid QR", "Cannot decode QR from image");
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     PERMISSION UI
  ======================= */

  const handleJoinTeam = async () => {
    if (!teamCode) return;

    try {
      setLoading(true);

      const res = await memberApi.join(teamCode);

      // 👇 nếu API trả success = false
      if (res?.success === false) {
        setErrorMessage(res?.message ?? "Cannot join team");
        setShowErrorModal(true);
        return;
      }

      // ✅ Join OK
      setShowModal(false); // đóng JoinTeamModal
      setShowSuccessModal(true); // mở SuccessModal
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Cannot join team";

      setErrorMessage(message);
      setShowErrorModal(true);
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
          <View className="w-11 h-11 rounded-full bg-[#fff] items-center justify-center">
            <MaterialCommunityIcons
              name="image-outline"
              size={30}
              color="black"
            />
          </View>

          <View style={{ width: 150 }}>
            <Text
              numberOfLines={2}
              ellipsizeMode="tail"
              style={{
                marginTop: 6,
                color: "white",
                fontSize: 18,
                textAlign: "center",
              }}
            >
              Choose image from gallery
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      {preview && (
        <JoinTeamModal
          visible={showModal}
          avatar={preview.avatarUrl}
          teamName={preview.name}
          description={preview.description ?? ""}
          ownerName={preview.creatorName}
          ownerAvatar={preview.creatorAvatarUrl}
          membersCount={preview.totalMembers}
          onJoin={handleJoinTeam}
          onClose={() => {
            setShowModal(false);
            setScanned(false);
          }}
        />
      )}

      <SuccessModal
        visible={showSuccessModal}
        title="Joined successfully!"
        message={`You have joined ${preview?.name ?? "the team"} successfully.`}
        confirmText="Go to teams"
        onConfirm={() => {
          setShowSuccessModal(false);
          setScanned(false);
          router.push("/(team)/search");
        }}
      />
      <ErrorModal
        visible={showErrorModal}
        title="Join failed"
        message={errorMessage}
        confirmText="Try again"
        cancelText="Close"
        onConfirm={() => setShowErrorModal(false)}
        onCancel={() => setShowErrorModal(false)}
      />
    </View>
  );
}
