import authApi from "@/api/authApi";
import { clearTokens, getUserIdFromToken, readTokens } from "@/api/tokenStore";
import userApi, { UserProfile } from "@/api/userApi";
import QuestionModal from "@/components/modal/question";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { View } from "react-native";
import { Avatar, Card, IconButton, List, Text } from "react-native-paper";

// Helper mapping gender
const formatGender = (g?: string | null) => {
  if (!g) return "Not specified";
  if (g === "MALE") return "Male";
  if (g === "FEMALE") return "Female";
  return g;
};

type ProfileScreenProps = {
  // userId: string;
};

export default function ProfileScreen({}: ProfileScreenProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const fetchData = async () => {
        try {
          const { accessToken } = await readTokens();
          if (!accessToken) return;

          const userId = getUserIdFromToken(accessToken);
          if (userId && !cancelled) {
            const data = await userApi.getById(userId);
            if (!cancelled) {
              setUser(data);
            }
          }
        } catch (e) {
          console.log("Fetch user error:", e);
        }
      };
      fetchData();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.log("Logout error:", error);
    } finally {
      await clearTokens();
      setShowLogoutModal(false);
      router.replace("/(auth)/login");
    }
  };

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
          style={{
            position: "absolute",
            top: 14,
            outlineColor: "#fff",
            borderWidth: 0,
          }}
        />
      </View>

      {/* Content */}
      <View className="px-4 pb-6">
        <Card
          mode="contained"
          style={{
            overflow: "visible",
            borderRadius: 0,
            backgroundColor: "#fff",
          }}
        >
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
                      label={
                        user.name ? user.name.charAt(0).toUpperCase() : "U"
                      }
                      labelStyle={{
                        fontSize: 58,
                        fontWeight: "800",
                        letterSpacing: 1,
                        color: "#fff",
                      }}
                      style={{ backgroundColor: "#90717E" }}
                    />
                  )}
                </View>
              </View>

              {/* Name */}
              <Text
                className="mt-3"
                style={{
                  fontWeight: "800",
                  letterSpacing: 0.5,
                  fontSize: 20,
                }}
              >
                {user.name}
              </Text>
            </View>

            {/* Info list */}
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

      {/* Actions */}
      <View className="mt-4 px-4">
        <Card
          mode="contained"
          style={{
            backgroundColor: "#fff",
          }}
        >
          <List.Item
            title="Change profile"
            left={(p) => <List.Icon {...p} icon="cog-outline" />}
            right={(p) => <List.Icon {...p} icon="chevron-right" />}
            onPress={() => {
              router.push("/(me)/editProfile");
            }}
          />

          <List.Item
            title="Reset password"
            left={(p) => <List.Icon {...p} icon="lock-reset" />}
            right={(p) => <List.Icon {...p} icon="chevron-right" />}
            onPress={() => {
              // router.push("/(me)/reset-password");
            }}
          />
          <List.Item
            title="Log out"
            titleStyle={{ color: "#E53935", fontWeight: "600" }}
            left={() => (
              <View
                style={{
                  width: 48,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="logout"
                  size={22}
                  color="#E53935"
                />
              </View>
            )}
            right={() => (
              <MaterialIcons name="chevron-right" size={22} color="#E53935" />
            )}
            onPress={() => setShowLogoutModal(true)}
          />
        </Card>
      </View>
      <QuestionModal
        visible={showLogoutModal}
        title="Log out?"
        message="Are you sure you want to log out of your account?"
        confirmText="Log out"
        cancelText="Cancel"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </View>
  );
}
