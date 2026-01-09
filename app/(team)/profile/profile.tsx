import userApi, { UserProfile } from "@/api/userApi";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import { View } from "react-native";
import { Avatar, Card, IconButton, List, Text } from "react-native-paper";

// ===== helper =====
const formatGender = (g?: string | null) => {
  if (!g) return "Not specified";
  if (g === "MALE") return "Male";
  if (g === "FEMALE") return "Female";
  return g;
};

export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [user, setUser] = useState<UserProfile | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const fetchUser = async () => {
        if (!id) return;
        try {
          const data = await userApi.getById(id);
          if (!cancelled) setUser(data);
        } catch (e) {
          console.log("❌ Fetch profile error:", e);
        }
      };

      fetchUser();
      return () => {
        cancelled = true;
      };
    }, [id])
  );

  if (!user) {
    return <View className="flex-1 bg-[#F2EFF0]" />;
  }

  return (
    <View className="flex-1 bg-[#F2EFF0]">
      {/* Header */}
      <View style={{ height: 140, backgroundColor: "#90717E" }}>
        <IconButton
          icon="arrow-left"
          onPress={() => router.back()}
          size={25}
          iconColor="#fff"
          style={{ position: "absolute", top: 14 }}
        />
      </View>

      {/* Content */}
      <View className="px-4 pb-6">
        <Card mode="contained" style={{ backgroundColor: "#fff" }}>
          <Card.Content>
            <View className="items-center">
              {/* Avatar */}
              <View style={{ marginTop: -65 }}>
                <View
                  style={{
                    borderWidth: 6,
                    borderColor: "#fff",
                    borderRadius: 999,
                  }}
                >
                  {user.avatarUrl ? (
                    <Avatar.Image size={120} source={{ uri: user.avatarUrl }} />
                  ) : (
                    <Avatar.Text
                      size={120}
                      label={user.name?.charAt(0).toUpperCase() ?? "U"}
                      labelStyle={{
                        fontSize: 58,
                        fontWeight: "800",
                        color: "#fff",
                      }}
                      style={{ backgroundColor: "#6B4EFF" }}
                    />
                  )}
                </View>
              </View>

              {/* Name */}
              <Text
                className="mt-3"
                style={{ fontWeight: "800", fontSize: 20 }}
              >
                {user.name}
              </Text>
            </View>

            {/* Info */}
            <View className="mt-4">
              <List.Item
                title={user.dateOfBirth || "Not set"}
                left={() => (
                  <MaterialIcons name="calendar-today" size={20} color="#555" />
                )}
              />
              <List.Item
                title={formatGender(user.gender)}
                left={() => (
                  <MaterialCommunityIcons
                    name="gender-female"
                    size={20}
                    color="#555"
                  />
                )}
              />
              <List.Item
                title={user.email || "No email"}
                left={() => (
                  <MaterialCommunityIcons
                    name="email-outline"
                    size={20}
                    color="#555"
                  />
                )}
              />
            </View>
          </Card.Content>
        </Card>
      </View>
    </View>
  );
}
