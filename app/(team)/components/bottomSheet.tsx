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

const SHEET_HEIGHT = Math.round(Dimensions.get("window").height * 0.5);

type Props = {
  qrVisible: boolean;
  onClose: () => void;
  teamName: string;
  qrImage: ImageSourcePropType; // { uri } hoặc require(...)
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
    // đặt anchor trước, rồi mới bật visible để Menu luôn có anchor hợp lệ
    setAnchorXY({ x: pageX, y: pageY + 8 });
    requestAnimationFrame(() => setMenuVisible(true));
  };

  const closeMenu = () => {
    setMenuVisible(false);
    setAnchorXY(undefined); // reset anchor -> lần sau đo lại
  };

  const handleSave = () => {
    closeMenu();
    // TODO: lưu ảnh QR vào gallery
  };

  const handleReset = () => {
    closeMenu();
    // TODO: gọi API reset/regenerate QR
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
          elevation={2}
          style={{
            height: SHEET_HEIGHT,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingHorizontal: 16,
            paddingTop: 10,
            paddingBottom: 24,
            backgroundColor: "#EFE7EA",
          }}
        >
          {/* drag indicator */}
          <View
            style={{
              alignSelf: "center",
              width: 48,
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
              size={20}
              onPress={handleCloseSheet}
            />
            <View className="flex-1" />
            <IconButton icon="dots-vertical" size={20} onPress={openMenuAt} />

            {/* Menu chỉ mount khi có anchor hợp lệ & đang mở */}
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

          {/* nội dung: ảnh + caption cùng bề ngang */}
          <View
            style={{
              alignSelf: "center",
              width: 260,
              alignItems: "center",
              marginTop: 6,
            }}
          >
            <View
              style={{
                width: "100%",
                backgroundColor: "#fff",
                padding: 14,
                borderRadius: 8,
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
                marginTop: 10,
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
