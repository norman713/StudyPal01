import React, { useEffect, useRef, useState } from "react";
import {
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
  teamName: string;
  qrImage: ImageSourcePropType;
};

export default function TeamQRSheetView({
  qrVisible,
  onClose,
  teamName,
  qrImage,
}: Props) {
  const insets = useSafeAreaInsets();

  // Animation states
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdrop = useRef(new Animated.Value(0)).current;

  // Menu states
  const [menuVisible, setMenuVisible] = useState(false);
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
  const handleSave = () => {
    closeMenu();
    // TODO: save QR to gallery
  };
  const handleReset = () => {
    closeMenu();
    // TODO: call API to reset/regenerate QR
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
          elevation={0} // không bóng để tránh "vệt xám" ở đáy
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
    </Portal>
  );
}
