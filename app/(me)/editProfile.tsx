import { getUserIdFromToken, readTokens } from "@/api/tokenStore";
import userApi, { UserProfile } from "@/api/userApi";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Avatar,
  Button,
  RadioButton,
  Text,
  TextInput,
} from "react-native-paper";

export default function EditProfileScreen() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "UNSPECIFIED">(
    "MALE"
  );
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [avatar, setAvatar] = useState<ImagePicker.ImagePickerAsset | null>(
    null
  );

  // Date Picker State
  const [showDatePicker, setShowDatePicker] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const fetchData = async () => {
        try {
          setLoading(true);
          const { accessToken } = await readTokens();
          if (!accessToken) return;

          const userId = getUserIdFromToken(accessToken);
          if (userId && !cancelled) {
            const data = await userApi.getById(userId);
            if (!cancelled) {
              setUser(data);
              setName(data.name || "");

              // Map existing "OTHER" to "UNSPECIFIED" if backend returns old value
              let g = data.gender as any;
              if (g === "OTHER") g = "UNSPECIFIED";
              setGender(g || "MALE");

              if (data.dateOfBirth) {
                setDateOfBirth(dayjs(data.dateOfBirth).toDate());
              }
            }
          }
        } catch (e) {
          console.log("Fetch user error:", e);
        } finally {
          if (!cancelled) setLoading(false);
        }
      };
      fetchData();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0]);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const dobString = dateOfBirth
        ? dayjs(dateOfBirth).format("YYYY-MM-DD")
        : undefined;

      // Log yêu cầu gửi trước khi thực hiện cập nhật
      console.log("Request to update profile:", {
        name,
        gender,
        dateOfBirth: dobString,
        avatar: avatar?.uri, // Đường dẫn URI của avatar nếu có
      });

      // Gửi request cập nhật hồ sơ
      await userApi.updateUser({
        name,
        gender,
        dateOfBirth: dobString,
        avatar: avatar || undefined, // Nếu avatar không có thì gửi undefined
      });

      // Quay lại màn hình trước
      router.back();
    } catch (error: any) {
      console.log("Update profile error:", error);
      if (error.response) {
        console.log(
          "Error response:",
          error.response.status,
          error.response.data
        );
      } else if (error.request) {
        console.log("Error request:", error.request);
      } else {
        console.log("Error message:", error.message);
      }
      Alert.alert("Error", `Failed to update profile: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#90717E" />
      </View>
    );
  }

  const avatarUri = avatar ? avatar.uri : user?.avatarUrl;
  const THEME_COLOR = "#90717E";

  return (
    <View className="flex-1 bg-white">
      {/* Custom Header */}
      <Appbar.Header mode="small" style={{ backgroundColor: "#90717E" }}>
        <Appbar.BackAction color="#F8F6F7" onPress={() => router.back()} />
        <Appbar.Content
          title="Edit profile"
          titleStyle={{ color: "#F8F6F7", fontWeight: "700", fontSize: 16 }}
        />
      </Appbar.Header>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ padding: 24 }}>
          {/* Avatar Section */}
          <View className="items-center mb-8 mt-4">
            <TouchableOpacity onPress={handlePickImage} activeOpacity={0.8}>
              <View className="relative">
                {avatarUri ? (
                  <Avatar.Image size={110} source={{ uri: avatarUri }} />
                ) : (
                  <Avatar.Text
                    size={110}
                    label={name ? name.charAt(0).toUpperCase() : "U"}
                    style={{ backgroundColor: "#6B4EFF" }}
                    color={"#fff"}
                  />
                )}
                <View
                  className="absolute bottom-0 right-0 bg-white rounded-full p-2 border border-gray-100"
                  style={{
                    elevation: 4,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 3,
                  }}
                >
                  <MaterialCommunityIcons
                    name="camera-outline"
                    size={22}
                    color="#666"
                  />
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View className="space-y-5">
            <TextInput
              label="Name"
              mode="outlined"
              value={name}
              onChangeText={setName}
              activeOutlineColor={THEME_COLOR}
              outlineColor="#DDDDDD"
              style={{ backgroundColor: "#fff" }}
              theme={{ roundness: 25 }} // Rounded pill shape
            />

            {/* Date of Birth based on design */}
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <View pointerEvents="none">
                <TextInput
                  label="Day of birth"
                  mode="outlined"
                  value={
                    dateOfBirth ? dayjs(dateOfBirth).format("DD-MM-YYYY") : ""
                  }
                  right={<TextInput.Icon icon="calendar-blank-outline" />}
                  editable={false}
                  activeOutlineColor={THEME_COLOR}
                  outlineColor="#DDDDDD"
                  style={{ backgroundColor: "#fff" }}
                  theme={{ roundness: 25 }}
                />
              </View>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={dateOfBirth || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )}

            {/* Sex (Gender) */}
            <View className="mt-2">
              <Text
                variant="bodyMedium"
                style={{ color: "#666", marginBottom: 8, marginLeft: 4 }}
              >
                Sex
              </Text>
              <View className="flex-row items-center justify-between px-2">
                <View className="flex-row items-center">
                  <RadioButton
                    value="MALE"
                    status={gender === "MALE" ? "checked" : "unchecked"}
                    onPress={() => setGender("MALE")}
                    color={THEME_COLOR}
                  />
                  <Text onPress={() => setGender("MALE")}>Male</Text>
                </View>
                <View className="flex-row items-center">
                  <RadioButton
                    value="FEMALE"
                    status={gender === "FEMALE" ? "checked" : "unchecked"}
                    onPress={() => setGender("FEMALE")}
                    color={THEME_COLOR}
                  />
                  <Text onPress={() => setGender("FEMALE")}>Female</Text>
                </View>
                <View className="flex-row items-center">
                  <RadioButton
                    value="UNSPECIFIED"
                    status={gender === "UNSPECIFIED" ? "checked" : "unchecked"}
                    onPress={() => setGender("UNSPECIFIED")}
                    color={THEME_COLOR}
                  />
                  <Text onPress={() => setGender("UNSPECIFIED")}>
                    Unspecified
                  </Text>
                </View>
              </View>
            </View>

            {/* Email Field - Read Only */}
            <TextInput
              label="Email"
              mode="outlined"
              value={user?.email || ""}
              editable={false}
              activeOutlineColor={THEME_COLOR}
              outlineColor="#DDDDDD"
              style={{ backgroundColor: "#fff" }}
              theme={{ roundness: 25 }}
            />

            {/* Spacer for bottom button visibility */}
            <View className="h-20" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Save Button */}
      <View className="p-4 bg-white border-t border-gray-100">
        <Button
          mode="contained"
          onPress={handleSave}
          loading={saving}
          disabled={saving}
          buttonColor={THEME_COLOR}
          style={{ borderRadius: 25, height: 50, justifyContent: "center" }}
          contentStyle={{ height: 50 }}
        >
          Save
        </Button>
      </View>
    </View>
  );
}
