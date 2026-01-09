import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Avatar } from "react-native-paper";

interface UpdateRoleModalProps {
  visible: boolean;
  userName: string;
  userAvatar?: string;
  currentRole: "MEMBER" | "ADMIN" | "OWNER";
  onSave: (newRole: "MEMBER" | "ADMIN" | "OWNER") => void;
  onCancel: () => void;
}

const ROLES = ["MEMBER", "ADMIN", "OWNER"];

export default function UpdateRoleModal({
  visible,
  userName,
  userAvatar,
  currentRole,
  onSave,
  onCancel,
}: UpdateRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // ✅ Fix: mỗi khi currentRole đổi, cập nhật lại state
  useEffect(() => {
    setSelectedRole(currentRole);
  }, [currentRole]);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View className="flex-1 bg-black/60 justify-center items-center px-6">
        <View className="bg-white w-full rounded-2xl p-6 relative items-center">
          {/* Close Button */}
          <TouchableOpacity
            className="absolute top-4 right-4"
            onPress={onCancel}
          >
            <MaterialIcons name="close" size={24} color="#90717E" />
          </TouchableOpacity>

          {/* Title */}
          <Text className="text-[18px] font-PoppinsSemiBold text-black mb-2">
            Select role
          </Text>

          {/* Subtitle */}
          <View className="flex-row items-center mb-4">
            {userAvatar ? (
              <Image
                source={{ uri: userAvatar }}
                className="w-14 h-14 rounded-full mr-2"
              />
            ) : (
              <Avatar.Text
                size={35}
                label={userName ? userName.charAt(0).toUpperCase() : "U"}
                labelStyle={{
                  fontSize: 20,
                  fontWeight: "400",
                  color: "#fff",
                }}
                style={{
                  backgroundColor: "#6B4EFF",
                  marginRight: 8,
                }}
              />
            )}

            <Text className="text-[15px] text-[#7E9181]">
              Change{" "}
              <Text className="text-black font-PoppinsMedium">{userName}</Text>
              ’s role
            </Text>
          </View>

          {/* Dropdown */}
          <Pressable
            onPress={() => setDropdownOpen(!dropdownOpen)}
            className="w-full border border-[#DADADA] rounded-lg py-2 px-3 flex-row justify-between items-center"
          >
            <Text className="text-[15px] text-black">{selectedRole}</Text>
            <MaterialIcons
              name={dropdownOpen ? "arrow-drop-up" : "arrow-drop-down"}
              size={22}
              color="#7E7E7E"
            />
          </Pressable>

          {/* Dropdown List */}
          {dropdownOpen && (
            <View className="w-full border border-[#E3E3E3] rounded-lg mt-2 bg-white">
              {ROLES.map((role) => (
                <TouchableOpacity
                  key={role}
                  className="px-3 py-2"
                  onPress={() => {
                    setSelectedRole(role as "MEMBER" | "ADMIN" | "OWNER");
                    setDropdownOpen(false);
                  }}
                >
                  <Text
                    className={`text-[15px] ${
                      selectedRole === role ? "text-[#90717E]" : "text-black"
                    }`}
                  >
                    {role}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Save Button */}
          <TouchableOpacity
            className="bg-[#90717E] rounded-full w-full py-3 mt-6 items-center"
            onPress={() => onSave(selectedRole)}
          >
            <Text className="text-white font-PoppinsRegular text-[15px]">
              Save
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
