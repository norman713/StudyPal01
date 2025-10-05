import { router } from "expo-router";
import React from "react";
import { View } from "react-native";
import {
  Avatar,
  Card,
  Divider,
  IconButton,
  List,
  Text,
} from "react-native-paper";

type Role = "member" | "admin" | "owner";

type TeamInfoProps = {
  role: Role;
  teamName: string;
  description?: string;
  avatarUri?: string;
  memberCount: number;
};

export default function TeamInfoScreen({
  role = "owner",
  teamName = "THIS IS TEAM NAME DEMO",
  description = "This is team description. You can write what ever here. Team Pikachu forever...",
  avatarUri,
  memberCount = 10,
}: TeamInfoProps) {
  const isOwner = role === "owner";
  const isAdmin = role === "admin";
  const canManage = isOwner || isAdmin;

  return (
    <View className="flex-1 bg-[#F3F3F3]">
      <View style={{ height: 140, backgroundColor: "#90717E" }}>
        <IconButton
          icon="arrow-left"
          onPress={() => router.back()}
          size={20}
          mode="outlined"
          style={{
            position: "absolute",
            top: 14,
            left: 10,
            outlineColor: "#fff",
            borderWidth: 0,
          }}
        />
      </View>

      {/* CONTENT */}
      <View className=" px-4 pb-6">
        {/* Card 1: Avatar + team name */}
        <Card
          mode="contained"
          style={{
            overflow: "visible",
            borderRadius: 0,
            backgroundColor: "#fff",
          }}
        >
          <Card.Content className="">
            <View className="items-center">
              {/* Avatar + camera overlay (owner only) */}
              <View style={{ marginTop: -50 }}>
                <View style={{ position: "relative" }}>
                  <View
                    style={{
                      borderWidth: 4,
                      borderColor: "#fff",
                      borderRadius: 999,
                    }}
                  >
                    {avatarUri ? (
                      <Avatar.Image size={96} source={{ uri: avatarUri }} />
                    ) : (
                      <Avatar.Text size={96} label={teamName.charAt(0)} />
                    )}
                  </View>

                  {isOwner && (
                    <IconButton
                      icon="camera-outline"
                      size={18}
                      mode="contained"
                      style={{
                        position: "absolute",
                        right: -6,
                        bottom: -6,
                        borderRadius: 999,
                      }}
                      onPress={() => router.push("/")}
                      accessibilityLabel="Change team avatar"
                    />
                  )}
                </View>
              </View>

              {/* Team name */}
              <View className="mt-3 flex-row items-center gap-1">
                <Text style={{ fontWeight: "800", letterSpacing: 0.2 }}>
                  {teamName}
                </Text>
                {isOwner && (
                  <IconButton
                    icon="pencil-outline"
                    size={16}
                    onPress={() => router.push("/")}
                    accessibilityLabel="Edit team name"
                  />
                )}
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Card 2: description*/}
        <Card
          mode="contained"
          style={{ marginTop: 10, borderRadius: 0, backgroundColor: "#fff" }}
        >
          <Card.Content>
            <View className="flex-row items-start gap-2">
              <IconButton icon="information-outline" size={16} />
              <Text className="flex-1 text-[13px] text-black/80">
                {description}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Card 3: Action lists */}
        <Card
          mode="contained"
          style={{ marginTop: 10, borderRadius: 0, backgroundColor: "#fff" }}
        >
          <Card.Content style={{ paddingVertical: 0 }}>
            {canManage && (
              <>
                <List.Item
                  title="QR code"
                  left={(p) => <List.Icon {...p} icon="qrcode" />}
                  right={(p) => <List.Icon {...p} icon="chevron-right" />}
                  onPress={() => router.push("/")}
                />
                <Divider />
              </>
            )}

            <List.Item
              title="Notification settings"
              left={(p) => <List.Icon {...p} icon="bell-outline" />}
              right={(p) => <List.Icon {...p} icon="chevron-right" />}
              onPress={() => router.push("/")}
            />
            <Divider />

            {canManage && (
              <>
                <List.Item
                  title="Invite user"
                  left={(p) => <List.Icon {...p} icon="account-plus-outline" />}
                  right={(p) => <List.Icon {...p} icon="chevron-right" />}
                  onPress={() => router.push("/")}
                />
                <Divider />
              </>
            )}

            <List.Item
              title={`Show members (${memberCount})`}
              left={(p) => <List.Icon {...p} icon="account-group-outline" />}
              right={(p) => <List.Icon {...p} icon="chevron-right" />}
              onPress={() => router.push("/")}
            />
            <Divider />

            {/* Leave team (mọi role) */}
            <List.Item
              title="Leave team"
              titleStyle={{ color: "#DF3B27", fontWeight: "600" }}
              left={(p) => <List.Icon {...p} color="#DF3B27" icon="logout" />}
              right={(p) => (
                <List.Icon {...p} color="#DF3B27" icon="chevron-right" />
              )}
              onPress={() => router.push("/")}
            />
            <Divider />

            {/* Delete team (owner-only) */}
            {isOwner && (
              <List.Item
                title="Delete team"
                titleStyle={{ color: "#DF3B27", fontWeight: "700" }}
                left={(p) => (
                  <List.Icon {...p} color="#DF3B27" icon="trash-can-outline" />
                )}
                right={(p) => (
                  <List.Icon {...p} color="#DF3B27" icon="chevron-right" />
                )}
                onPress={() => router.push("/")}
              />
            )}
          </Card.Content>
        </Card>
      </View>
    </View>
  );
}
