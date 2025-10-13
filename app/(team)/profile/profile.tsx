import { router } from "expo-router";
import React from "react";
import { View } from "react-native";
import { Avatar, Card, IconButton, List, Text } from "react-native-paper";

type UserProfile = {
  id: string;
  name: string;
  avatarUri?: string;
  birthday?: string;
  gender?: "Male" | "Female" | "Other";
  email?: string;
};

type ProfileScreenProps = {
  userId: string;
};

export default function ProfileScreen({ userId }: ProfileScreenProps) {
  // Mock data – sau này bạn có thể fetch từ API
  const mockUser: UserProfile = {
    id: userId,
    name: "Nguyetlun115",
    avatarUri:
      "https://i.pinimg.com/originals/52/03/36/5203363dc8ac038c730c6e5b3ac17d26.jpg",
    birthday: "12-12-1212",
    gender: "Female",
    email: "nguyetkhongcao@gmail.com",
  };

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
                  {mockUser.avatarUri ? (
                    <Avatar.Image
                      size={120}
                      source={{ uri: mockUser.avatarUri }}
                    />
                  ) : (
                    <Avatar.Text
                      size={120}
                      label={mockUser.name.charAt(0)}
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
                {mockUser.name}
              </Text>
            </View>

            {/* Info list */}
            <View className="mt-4">
              <List.Item
                title={mockUser.birthday || "Not set"}
                left={(p) => <List.Icon {...p} icon="calendar" />}
              />
              <List.Item
                title={mockUser.gender || "Not specified"}
                left={(p) => <List.Icon {...p} icon="gender-female" />}
              />
              <List.Item
                title={mockUser.email || "No email"}
                left={(p) => <List.Icon {...p} icon="email-outline" />}
              />
            </View>
          </Card.Content>
        </Card>
      </View>
    </View>
  );
}
