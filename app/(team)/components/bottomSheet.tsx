import React, { useState } from "react";
import {
  Dimensions,
  GestureResponderEvent,
  ImageSourcePropType,
  Image as RNImage,
  View,
} from "react-native";
import {
  IconButton,
  Menu,
  Modal,
  Portal,
  Surface,
  Text,
} from "react-native-paper";

const SHEET_HEIGHT = Math.round(Dimensions.get("window").height * 0.6);

type Props = {
  qrVisible: boolean;
  onClose: () => void;
  teamName: string;
  qrImage: ImageSourcePropType;
};

export default function TeamQRSheet({
  qrVisible,
  onClose,
  teamName,
  qrImage,
}: Props) {
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
    setAnchorXY(undefined); // reset anchor
  };

  const handleSave = () => {
    closeMenu();
    // TODO: save QR in gallery
  };

  const handleReset = () => {
    closeMenu();
    // TODO: call API reset/regenerate QR
  };

  const handleCloseSheet = () => {
    closeMenu();
    onClose();
  };

  return (
    <Portal>
      <Modal
        visible={qrVisible}
        onDismiss={handleCloseSheet}
        contentContainerStyle={{ flex: 1, justifyContent: "flex-end" }}
      >
        <Surface
          style={{
            height: SHEET_HEIGHT,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingHorizontal: 16,
            paddingTop: 20,
            paddingBottom: 24,
            backgroundColor: "#F2EFF0",
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
          <View className="flex-row items-center">
            <IconButton
              icon="arrow-left"
              size={30}
              iconColor="#90717E"
              onPress={handleCloseSheet}
            />
            <View className="flex-1" />
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
                contentStyle={{ backgroundColor: "#EFE7EA", borderRadius: 12 }}
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

          <View
            style={{
              alignSelf: "center",
              width: 260,
              alignItems: "center",
              marginTop: 60,
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
                style={{ width: "100%", height: 210, resizeMode: "contain" }}
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
      </Modal>
    </Portal>
  );
}
