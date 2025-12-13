import { useUser } from "@/context/userContext";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { View } from "react-native";
import { Avatar, Card, IconButton, List, Text } from "react-native-paper";

type ProfileScreenProps = {
  userId: string;
};

export default function ProfileScreen({ userId }: ProfileScreenProps) {
  // Mock data – sau này bạn có thể fetch từ API
  const { user } = useUser();

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
                    overflow: "hidden"
                  }}
                >
                  {user?.avatarUrl ? (
                    <Avatar.Image
                      size={120}
                      source={{ uri: user.avatarUrl }}
                    />
                  ) : (
                    <Avatar.Text
                      size={120}
                      label={user?.name.charAt(0) || ""}
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
                {user?.name}
              </Text>
            </View>

            {/* Info list */}
            <View className="mt-4">
              <List.Item
                title={user?.dateOfBirth || "Not set"}
                left={(p) => <List.Icon {...p} icon="calendar" />}
              />
              <List.Item
                title={user?.gender || "Not specified"}
                left={(p) => <List.Icon {...p} icon="gender-female" />}
              />
              <List.Item
                title={user?.email || "No email"}
                left={(p) => <List.Icon {...p} icon="email-outline" />}
              />
            </View>
          </Card.Content>
        </Card>
      </View>
    </View>
  );
}
