import memberApi from "@/api/memberApi";
import teamApi from "@/api/teamApi";
import ErrorModal from "@/components/modal/error";
import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, View } from "react-native";
import {
  Avatar,
  Card,
  IconButton,
  List,
  Text,
  TouchableRipple,
} from "react-native-paper";
import TeamQRSheet from "./components/bottomSheet";
import TeamNameModal from "./components/teamName";

type Role = "MEMBER" | "ADMIN" | "OWNER";

type TeamInfoProps = {
  id: string;
  name: string;
  role: Role;
  avatarUri?: string;
  description?: string;
  totalMembers: number;
};

export default function TeamInfoScreen({
  role = "OWNER",
  name = "THIS IS TEAM NAME DEMO",
  description = "This is team description. You can write what ever here. Team Pikachu forever...",
  avatarUri,
  totalMembers = 10,
}: TeamInfoProps) {
  //Router params
  const { id } = useLocalSearchParams();

  const isOwner = role === "OWNER";
  const isAdmin = role === "ADMIN";
  const canManage = isOwner || isAdmin;

  //States
  const [qrVisible, setQrVisible] = useState(false);
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const handleOpenQR = () => setQrVisible(true);
  const handleCloseQR = () => setQrVisible(false);
  const [error, setError] = useState<string | null>(null);
  const openQR = () => setQrVisible(true);
  const closeQR = () => setQrVisible(false);
  const qrImage = {
    uri: "https://api.qrserver.com/v1/create-qr-code/?size=210x210&data=Demo",
  };
  const [leaveModalVisible, setLeaveModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [teamNameModalVisible, setTeamNameModalVisible] = useState(false);
  const [teamNameValue, setTeamNameValue] = useState(name);

  const fetchTeamInfo = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await teamApi.getInfo(id as string);
      console.log("This is data :", data);
      setTeam(data);
    } catch (err: any) {
      console.error("Failed to fetch team info:", err);
      setError("Failed to load team information. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  // first load
  useEffect(() => {
    fetchTeamInfo();
  }, [id]);
  // when come back to screen
  useFocusEffect(
    useCallback(() => {
      fetchTeamInfo();
    }, [id])
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F2EFF0]">
        <ActivityIndicator size="large" color="#90717E" />
        <Text className="mt-2 text-gray-600">Loading team information...</Text>
      </View>
    );
  }
  //Handlers
  const handleNotiSettings = () => {
    router.push("/(team)/noti");
  };

  const handleDescription = () => {
    router.push({
      pathname: "/(team)/description",
      params: {
        teamId: id,
        description: team?.description ?? "",
      },
    });
  };

  const handleInvite = () => {
    router.push("/(team)/invite");
  };
  const handleShowMember = () => {
    router.push({
      pathname: "/(team)/member",
      params: {
        teamId: id,
        number: team?.totalMembers ?? 0,
        role: team.role,
      },
    });
  };
  const handleLeave = () => {
    setLeaveModalVisible(true);
  };
  const handleConfirmLeave = async () => {
    if (!id) return;
    setLeaveModalVisible(false);
    setLoading(true);
    try {
      await memberApi.leave(id as string);
      router.push("/(team)/search");
    } catch (err: any) {
      setError("Failed to leave team. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setDeleteModalVisible(true);
  };
  const handleConfirmLDelete = async () => {
    if (!id) return;
    setDeleteModalVisible(false);
    setLoading(true);
    try {
      await teamApi.delete(id as string);
      router.push("/(team)/search");
    } catch (err: any) {
      setError("Failed to delete team. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const SHEET_HEIGHT = Math.round(Dimensions.get("window").height * 0.5);
  return (
    <View className="flex-1 bg-[#F2EFF0]">
      <View style={{ height: 140, backgroundColor: "#90717E" }}>
        <IconButton
          icon="arrow-left"
          onPress={() => router.back()}
          size={25}
          iconColor="#fff"
          mode="outlined"
          style={{
            position: "absolute",
            top: 14,
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
              <View style={{ marginTop: -65 }}>
                <View style={{ position: "relative" }}>
                  <View
                    style={{
                      borderWidth: 6,
                      borderColor: "#fff",
                      borderRadius: 999,
                    }}
                  >
                    {team?.avatarUrl ? (
                      <Avatar.Image
                        size={120}
                        source={{ uri: team.avatarUrl }}
                      />
                    ) : (
                      <Avatar.Text
                        size={120}
                        label={name.charAt(0)}
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

                  {isOwner && (
                    <IconButton
                      icon="camera-outline"
                      size={30}
                      iconColor="#90717E"
                      mode="contained-tonal"
                      style={{
                        position: "absolute",
                        right: 0,
                        bottom: -10,
                        borderBlockColor: "#ccc",
                        backgroundColor: "#fff",
                      }}
                      onPress={() => router.push("/")}
                      accessibilityLabel="Change team avatar"
                    />
                  )}
                </View>
              </View>

              {/* Team name */}
              <View className="mt-3 flex-row items-center">
                <Text
                  style={{
                    fontWeight: "800",
                    letterSpacing: 0.5,
                    fontSize: 20,
                  }}
                >
                  {team?.name ?? "Loading..."}
                </Text>
                {isOwner && (
                  <IconButton
                    icon="pencil-outline"
                    size={24}
                    iconColor="#90717E"
                    onPress={() => setTeamNameModalVisible(true)}
                    accessibilityLabel="Edit team name"
                    style={{ marginLeft: -6 }}
                  />
                )}
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Card 2: description*/}
        <Card
          mode="contained"
          style={{
            marginTop: 10,
            borderRadius: 0,
            padding: 10,
            backgroundColor: "#fff",
          }}
        >
          <TouchableRipple
            onPress={isOwner ? handleDescription : undefined}
            disabled={!isOwner}
            rippleColor="rgba(0,0,0,0.08)"
            style={{ borderRadius: 0 }}
            accessibilityRole="button"
            accessibilityState={{ disabled: !isOwner }}
            accessibilityHint="Open team description"
          >
            <Card.Content>
              <View className="flex-row items-center gap-2">
                <IconButton icon="information-outline" size={24} disabled />
                <Text className="flex-1 text-[15px] text-black/80">
                  {team?.description ?? "No description provided."}
                </Text>
              </View>
            </Card.Content>
          </TouchableRipple>
        </Card>

        {/* Card 3: Action lists */}
        <Card
          mode="contained"
          style={{ marginTop: 10, borderRadius: 0, backgroundColor: "#fff" }}
        >
          <Card.Content>
            {canManage && (
              <>
                <List.Item
                  title="QR code"
                  left={(p) => (
                    <FontAwesome name="qrcode" size={24} color="black" />
                  )}
                  right={(p) => (
                    <FontAwesome name="caret-right" size={20} color="#49454F" />
                  )}
                  onPress={openQR}
                  style={{ paddingRight: 0 }}
                />
              </>
            )}

            <List.Item
              title="Notification settings"
              left={(props) => (
                <FontAwesome name="gear" size={24} color="black" />
              )}
              right={(p) => (
                <FontAwesome name="caret-right" size={20} color="#49454F" />
              )}
              onPress={handleNotiSettings}
              style={{ paddingRight: 0 }}
            />

            {canManage && (
              <>
                <List.Item
                  title="Invite user"
                  left={(p) => (
                    <FontAwesome name="user-plus" size={24} color="black" />
                  )}
                  right={(p) => (
                    <FontAwesome name="caret-right" size={20} color="#49454F" />
                  )}
                  onPress={handleInvite}
                  style={{ paddingRight: 0 }}
                />
              </>
            )}

            <List.Item
              title={`Show members (${team?.totalMembers})`}
              left={(p) => <FontAwesome name="users" size={24} color="black" />}
              right={(p) => (
                <FontAwesome name="caret-right" size={20} color="#49454F" />
              )}
              onPress={handleShowMember}
              style={{ paddingRight: 0 }}
            />

            {/* All role) */}
            <List.Item
              title="Leave team"
              titleStyle={{ color: "#DF3B27", fontWeight: "600" }}
              left={(p) => (
                <FontAwesome name="sign-out" size={24} color="#DF3B27" />
              )}
              right={(p) => (
                <FontAwesome name="caret-right" size={20} color="#DF3B27" />
              )}
              style={{ paddingRight: 0 }}
              onPress={handleLeave}
            />

            {/* Delete team (owner-only) */}
            {isOwner && (
              <List.Item
                title="Delete team"
                titleStyle={{ color: "#DF3B27", fontWeight: "600" }}
                left={(p) => (
                  <FontAwesome name="trash" size={24} color="#DF3B27" />
                )}
                right={(p) => (
                  <FontAwesome name="caret-right" size={20} color="#DF3B27" />
                )}
                style={{ paddingRight: 0 }}
                onPress={handleDelete}
              />
            )}
          </Card.Content>
        </Card>
      </View>

      {/* QR bottom sheet */}
      <TeamQRSheet
        qrVisible={qrVisible}
        onClose={closeQR}
        teamName={name}
        qrImage={qrImage}
      />

      {/* ⚠️ ErrorModal  Leave */}
      <ErrorModal
        visible={leaveModalVisible}
        title="Leave team?"
        message="Are you sure you want to leave this team?"
        confirmText="Leave"
        onConfirm={handleConfirmLeave}
        onCancel={() => setLeaveModalVisible(false)}
      />
      {/* ⚠️ ErrorModal  Delete */}
      <ErrorModal
        visible={deleteModalVisible}
        title="Leave team?"
        message="Are you sure you want to delete this team?"
        confirmText="Leave"
        onConfirm={handleConfirmLDelete}
        onCancel={() => setDeleteModalVisible(false)}
      />
      <TeamNameModal
        visible={teamNameModalVisible}
        initialName={team.name}
        onCancel={() => setTeamNameModalVisible(false)}
        onSave={async (newName) => {
          if (!id) return;
          setTeamNameModalVisible(false);
          setLoading(true);
          try {
            await teamApi.update(id as string, { name: newName });
            setTeam((prev: any) => ({ ...prev, name: newName }));
            setTeamNameValue(newName);
            await fetchTeamInfo();
          } catch (err: any) {
            console.error("Failed to update team name:", err);
            setError("Failed to update team name. Please try again later.");
          } finally {
            setLoading(false);
          }
        }}
      />
    </View>
  );
}
