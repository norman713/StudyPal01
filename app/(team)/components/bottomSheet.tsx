// import * as FileSystem from "expo-file-system";
import SuccessModal from "@/components/modal/success";
import { Directory, Paths } from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  BackHandler,
  Dimensions,
  GestureResponderEvent,
  ImageSourcePropType,
  Pressable,
  Image as RNImage,
  View,
} from "react-native";
import { IconButton, Menu, Portal, Surface, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
const SHEET_HEIGHT = Math.round(Dimensions.get("window").height * 0.6);
const ANIM_DUR = 220;

type Props = {
  qrVisible: boolean;
  onClose: () => void;
  onReset?: () => void;
  teamName: string;
  qrImage?: ImageSourcePropType;
  qrBase64?: string;
};

export default function TeamQRSheetView({
  qrVisible,
  onClose,
  onReset,
  teamName,
  qrImage,
  qrBase64,
}: Props) {
  const insets = useSafeAreaInsets();

  // Animation states
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdrop = useRef(new Animated.Value(0)).current;

  // Menu states
  const [menuVisible, setMenuVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [anchorXY, setAnchorXY] = useState<
    { x: number; y: number } | undefined
  >(undefined);

  // --- handlers ---
  const openMenuAt = (e: GestureResponderEvent) => {
    const { pageX, pageY } = e.nativeEvent;
    setAnchorXY({ x: pageX, y: pageY + 8 });
    requestAnimationFrame(() => setMenuVisible(true));
  };
  const closeMenu = () => {
    setMenuVisible(false);
    setAnchorXY(undefined);
  };
  const handleSave = async () => {
    try {
      closeMenu();

      if (!qrBase64) {
        Alert.alert("Error", "QR code data not found");
        return;
      }

      // 1) xin quyền
      const { granted } = await MediaLibrary.requestPermissionsAsync();
      if (!granted) {
        Alert.alert("Permission denied");
        return;
      }

      // 2) tạo folder cache/qr-temp nếu chưa có
      const qrDir = new Directory(Paths.cache, "qr-temp");
      const dirInfo = await qrDir.info();
      if (!dirInfo.exists) {
        await qrDir.create();
      }

      // 3) tạo file
      const fileName = `qr_${Date.now()}.png`;
      const qrFile = await qrDir.createFile(fileName, "image/png");

      // 4) decode base64 → bytes
      const base64Clean = qrBase64.replace(/^data:image\/png;base64,/, "");
      const decoded = Uint8Array.from(atob(base64Clean), (c) =>
        c.charCodeAt(0)
      );

      // 5) ghi file
      await qrFile.write(decoded);

      // 6) lưu vào gallery
      const asset = await MediaLibrary.createAssetAsync(qrFile.uri);
      await MediaLibrary.createAlbumAsync("QR Codes", asset, false);

      setSuccessMessage("QR code saved to gallery.");
      setSuccessVisible(true);
    } catch (error) {
      console.error("Save QR error", error);
      Alert.alert("Error", "Failed to save QR code");
    }
  };

  const handleReset = () => {
    closeMenu();

    if (onReset) {
      onReset();

      setSuccessMessage("QR code has been reset successfully.");
      setSuccessVisible(true);
    } else {
      console.warn("⚠️ No onReset handler provided");
    }
  };

  const animateOpen = () =>
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: ANIM_DUR,
        useNativeDriver: true,
      }),
      Animated.timing(backdrop, {
        toValue: 1,
        duration: ANIM_DUR,
        useNativeDriver: true,
      }),
    ]).start();

  const animateClose = (cb?: () => void) =>
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SHEET_HEIGHT,
        duration: ANIM_DUR,
        useNativeDriver: true,
      }),
      Animated.timing(backdrop, {
        toValue: 0,
        duration: ANIM_DUR,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => finished && cb?.());

  const handleClose = () => {
    closeMenu();
    animateClose(onClose);
  };

  // Drive animations from prop
  useEffect(() => {
    if (qrVisible) animateOpen();
    else animateClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrVisible]);

  // Android back button closes sheet
  useEffect(() => {
    if (!qrVisible) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      handleClose();
      return true;
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrVisible]);

  if (!qrVisible) return null;

  return (
    <Portal>
      {/* Backdrop */}
      <Animated.View
        pointerEvents="auto"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          opacity: backdrop,
        }}
      >
        {/* Tap outside to close */}
        <Pressable style={{ flex: 1 }} onPress={handleClose} />
      </Animated.View>

      {/* Bottom Sheet */}
      <Animated.View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          transform: [{ translateY }],
        }}
      >
        <Surface
          style={{
            height: SHEET_HEIGHT,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            backgroundColor: "#F2EFF0",
            paddingTop: 20,
            paddingHorizontal: 16,
            paddingBottom: Math.max(24, insets.bottom), // safe-area
            overflow: "hidden",
          }}
        >
          {/* drag indicator */}
          <View
            style={{
              alignSelf: "center",
              width: 50,
              height: 4,
              borderRadius: 99,
              backgroundColor: "rgba(0,0,0,0.25)",
              marginBottom: 12,
            }}
          />

          {/* header */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <IconButton
              icon="arrow-left"
              size={30}
              iconColor="#90717E"
              onPress={handleClose}
            />
            <View style={{ flex: 1 }} />
            <IconButton
              icon="dots-vertical"
              iconColor="#90717E"
              size={30}
              onPress={openMenuAt}
            />
            {menuVisible && anchorXY && (
              <Menu
                visible={menuVisible}
                onDismiss={closeMenu}
                anchor={anchorXY}
                anchorPosition="bottom"
                contentStyle={{
                  backgroundColor: "#EFE7EA",
                  borderRadius: 12,
                }}
              >
                <Menu.Item
                  leadingIcon="download"
                  onPress={handleSave}
                  title="Save code"
                />
                <Menu.Item
                  leadingIcon="refresh"
                  onPress={handleReset}
                  title="Reset code"
                />
              </Menu>
            )}
          </View>

          {/* content */}
          <View
            style={{
              alignSelf: "center",
              width: 300,
              alignItems: "center",
              marginTop: 20,
            }}
          >
            <View
              style={{
                width: "100%",
                backgroundColor: "#fff",
                padding: 14,
              }}
            >
              <RNImage
                source={qrImage}
                style={{ width: "100%", height: 260, resizeMode: "contain" }}
              />
            </View>

            <Text
              style={{
                width: "100%",
                textAlign: "center",
                marginTop: 20,
                color: "#333",
              }}
            >
              Invite user to team “{teamName}” by this QR code
            </Text>
          </View>
        </Surface>
      </Animated.View>

      <SuccessModal
        visible={successVisible}
        title="Success!"
        message={successMessage}
        confirmText="OK"
        onConfirm={() => {
          setSuccessVisible(false);
        }}
      />
    </Portal>
  );
}
