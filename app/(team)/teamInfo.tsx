import memberApi from "@/api/memberApi";
import teamApi from "@/api/teamApi";
import ErrorModal from "@/components/modal/error";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { Avatar, Card, IconButton, List, Text } from "react-native-paper";
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

export default function TeamInfoScreen() {
  //Router params
  const { id } = useLocalSearchParams();

  //States
  const [qrVisible, setQrVisible] = useState(false);
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tính isOwner, isAdmin từ team.role (data từ API)
  const isOwner = team?.role === "OWNER";
  const isAdmin = team?.role === "ADMIN";
  const canManage = isOwner || isAdmin;
  const openQR = () => setQrVisible(true);
  const closeQR = () => setQrVisible(false);
  const qrImage = {
    uri: "https://api.qrserver.com/v1/create-qr-code/?size=210x210&data=Demo",
  };
  const [leaveModalVisible, setLeaveModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [teamNameModalVisible, setTeamNameModalVisible] = useState(false);
  const [teamNameValue, setTeamNameValue] = useState("");

  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [totalMembers, setTotalMembers] = useState<number>(0);

  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const fetchMemberCount = useCallback(async () => {
    if (!id) return;
    try {
      const res = await memberApi.getAll(id as string);
      setTotalMembers(res?.members?.length ?? 0);
    } catch (err) {
      console.error("Failed to fetch member count:", err);
    }
  }, [id]);

  const fetchTeamInfo = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await teamApi.getInfo(id as string);

      // Debug: Check if description exists in different field names
      const possibleDescFields = [
        "description",
        "desc",
        "teamDescription",
        "about",
      ];
      possibleDescFields.forEach((field) => {
        if ((data as any)?.[field]) {
          console.log(
            `Found description in field '${field}':`,
            (data as any)[field]
          );
        }
      });

      setTeam(data);
    } catch (err: any) {
      console.error("Failed to fetch team info:", err);

      if (err?.response?.status === 401) {
        setError("Your session has expired. Please login again.");
      } else {
        setError("Failed to load team information. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      fetchTeamInfo();
      fetchMemberCount();
    }
  }, [isFocused, fetchTeamInfo, fetchMemberCount]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F2EFF0]">
        <ActivityIndicator size="large" color="#90717E" />
        <Text className="mt-2 text-gray-600">Loading team information...</Text>
      </View>
    );
  }

  if (error || !team) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F2EFF0] px-6">
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={64}
          color="#FF5F57"
        />
        <Text className="mt-4 text-lg font-semibold text-center">
          {error || "Team not found"}
        </Text>
        <Text className="mt-2 text-sm text-gray-600 text-center">
          {error?.includes("session")
            ? "Please try logging in again."
            : "This team may have been deleted or you don't have access."}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 bg-[#90717E] px-6 py-3 rounded-full"
        >
          <Text className="text-white font-medium">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  //Handlers
  const handleNotiSettings = () => {
    if (!id) return;
    router.push({
      pathname: "/(team)/noti",
      params: {
        teamId: id,
      },
    });
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
    if (!id) return;

    console.log("Navigating to Invite with teamId:", id);
    // Use URL query param to be explicit
    router.push(`/(team)/invite?teamId=${id}`);
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
      const res = await memberApi.leave(id as string);

      router.replace("/(team)/search");
    } catch (err: any) {
      // ✅ Map message từ API
      const apiMessage =
        err?.response?.data?.message ||
        "Failed to leave team. Please try again later.";

      setErrorMessage(apiMessage);
      setErrorModalVisible(true);
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
      const res = await teamApi.delete(id as string);
      router.replace({
        pathname: "/(team)/search",
        params: { refresh: Date.now().toString() },
      });
    } catch (err: any) {
      setError("Failed to delete team. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // ABOUT QR HANDLER
  const handleOpenQR = async () => {
    if (!id) return;

    setQrLoading(true);
    try {
      const base64 = await teamApi.getQR(id as string, 300, 300);

      if (!base64) {
        throw new Error("QR missing");
      }

      setQrBase64(base64);
      setQrVisible(true);
    } catch (err) {
      console.error("Failed to fetch QR:", err);
      setError("Failed to load QR code. Please try again later.");
    } finally {
      setQrLoading(false);
    }
  };

  const handleResetQR = async () => {
    if (!id) return;
    try {
      setQrLoading(true);
      const res = await teamApi.resetQR(id as string);
      const newBase64 = await teamApi.getQR(id as string, 300, 300);
      setQrBase64(newBase64);
    } catch (err) {
      console.error("Failed to reset QR:", err);
      Alert.alert("Error", "Could not reset QR code.");
    } finally {
      setQrLoading(false);
    }
  };

  const handlePickImage = async () => {
    if (!isOwner) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      // Upload immediately
      setLoading(true);
      try {
        await teamApi.update(id as string, { file: asset });
        // Refresh team info
        await fetchTeamInfo();
      } catch (err: any) {
        console.error("Failed to update avatar:", err);
        setError("Failed to update team avatar. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const SHEET_HEIGHT = Math.round(Dimensions.get("window").height * 0.5);
  return (
    <>
      <View className="flex-1 bg-[#F2EFF0]">
        {/* FIXED HEADER SECTION */}
        <View style={{ backgroundColor: "#F2EFF0" }}>
          {/* Purple Header Background */}
          <View style={{ height: 180, backgroundColor: "#90717E" }}>
            <IconButton
              icon="arrow-left"
              onPress={() => router.back()}
              size={25}
              iconColor="#fff"
              mode="outlined"
              style={{
                position: "absolute",
                top: 14,
                left: 0,
                zIndex: 10,
              }}
            />
          </View>

          {/* Avatar - Overlapping the header boundary */}
          <View
            style={{
              position: "absolute",
              top: 120,
              left: 0,
              right: 0,
              alignItems: "center",
              zIndex: 100,
            }}
          >
            <View style={{ position: "relative" }}>
              <View
                style={{
                  borderWidth: 8,
                  borderColor: "#fff",
                  borderRadius: 999,
                  backgroundColor: "#fff",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                {team?.avatarUrl ? (
                  <Avatar.Image size={120} source={{ uri: team.avatarUrl }} />
                ) : (
                  <Avatar.Text
                    size={120}
                    label={(team?.name ?? "T").charAt(0)}
                    labelStyle={{
                      fontSize: 58,
                      fontWeight: "800",
                      letterSpacing: 1,
                      color: "#fff",
                    }}
                    style={{ backgroundColor: "#6B4EFF" }}
                  />
                )}
              </View>

              {isOwner && (
                <View
                  style={{
                    position: "absolute",
                    right: 0,
                    bottom: 5,
                    borderRadius: 999,
                    backgroundColor: "#90717E",
                    borderWidth: 3,
                    borderColor: "#fff",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 4,
                    elevation: 5,
                  }}
                >
                  <IconButton
                    icon="camera"
                    size={18}
                    iconColor="#fff"
                    onPress={handlePickImage}
                    accessibilityLabel="Change team avatar"
                    style={{ margin: 0 }}
                  />
                </View>
              )}
            </View>
          </View>

          {/* Team Name & Description - Below avatar */}
          <View
            style={{
              paddingTop: 70,
              paddingHorizontal: 16,
              alignItems: "center",
              paddingBottom: 20,
            }}
          >
            {/* Team name with edit button */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
                marginTop: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "600",
                  color: "#1C1B1F",
                  marginRight: 8,
                }}
              >
                {team?.name ?? "Loading..."}
              </Text>
              {isOwner && (
                <TouchableOpacity onPress={() => setTeamNameModalVisible(true)}>
                  <MaterialCommunityIcons
                    name="pencil"
                    size={20}
                    color="#49454F"
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Description Card - Clickable */}
            <TouchableOpacity
              onPress={isOwner ? handleDescription : undefined}
              disabled={!isOwner}
              activeOpacity={0.7}
              style={{ width: "100%" }}
            >
              <Card
                mode="contained"
                style={{
                  borderRadius: 12,
                  backgroundColor: "#F8F6F7",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Card.Content style={{ paddingVertical: 12 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#49454F",
                      textAlign: "center",
                      lineHeight: 20,
                    }}
                  >
                    {team?.description || "No description"}
                  </Text>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          </View>
        </View>

        {/* SCROLLABLE MENU SECTION */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          <View className="px-4">
            {/* Card 3: Section 1 - QR, Invite, Members */}
            {(canManage || true) && (
              <Card
                mode="contained"
                style={{
                  marginTop: 10,
                  borderRadius: 0,
                  backgroundColor: "#F8F6F7",
                }}
              >
                <Card.Content
                  style={{ paddingHorizontal: 10, paddingVertical: 12 }}
                >
                  {canManage && (
                    <>
                      <List.Item
                        title="QR code"
                        titleStyle={{ color: "#1D1B20", fontWeight: "400" }}
                        left={(p) => (
                          <Ionicons name="qr-code" size={24} color="#49454F" />
                        )}
                        right={(p) => (
                          <Ionicons
                            name="chevron-forward"
                            size={24}
                            color="#49454F"
                          />
                        )}
                        onPress={handleOpenQR}
                        style={{ paddingRight: 0, paddingLeft: 0 }}
                      />

                      <List.Item
                        title="Invite user"
                        titleStyle={{ color: "#1D1B20", fontWeight: "400" }}
                        left={(p) => (
                          <Ionicons
                            name="person-add"
                            size={24}
                            color="#49454F"
                          />
                        )}
                        right={(p) => (
                          <Ionicons
                            name="chevron-forward"
                            size={24}
                            color="#49454F"
                          />
                        )}
                        onPress={handleInvite}
                        style={{ paddingRight: 0, paddingLeft: 0 }}
                      />
                    </>
                  )}

                  <List.Item
                    title={`Show members (${totalMembers})`}
                    titleStyle={{ color: "#1D1B20", fontWeight: "400" }}
                    left={(p) => (
                      <Ionicons name="people" size={24} color="#49454F" />
                    )}
                    right={(p) => (
                      <Ionicons
                        name="chevron-forward"
                        size={24}
                        color="#49454F"
                      />
                    )}
                    onPress={handleShowMember}
                    style={{ paddingRight: 0, paddingLeft: 0 }}
                  />
                </Card.Content>
              </Card>
            )}

            {/* Card 4: Section 2 - Plans, Documents, Statistic, Recover */}
            <Card
              mode="contained"
              style={{
                marginTop: 10,
                borderRadius: 0,
                backgroundColor: "#F8F6F7",
              }}
            >
              <Card.Content
                style={{ paddingHorizontal: 10, paddingVertical: 12 }}
              >
                <List.Item
                  title="Chat"
                  titleStyle={{ color: "#1D1B20", fontWeight: "400" }}
                  left={(p) => (
                    <Ionicons name="chatbubble" size={24} color="#49454F" />
                  )}
                  right={(p) => (
                    <Ionicons
                      name="chevron-forward"
                      size={24}
                      color="#49454F"
                    />
                  )}
                  onPress={() => {
                    console.log("Navigating to chat from TeamInfo. ID:", id);
                    if (!id) {
                      Alert.alert("Error", "Team ID is missing");
                      return;
                    }
                    router.push({
                      pathname: "/(team)/chat",
                      params: { teamId: id, role: team?.role },
                    });
                  }}
                  style={{ paddingRight: 0, paddingLeft: 0 }}
                />
                <List.Item
                  title="Plans"
                  titleStyle={{ color: "#1D1B20", fontWeight: "400" }}
                  left={(p) => (
                    <MaterialIcons
                      name="track-changes"
                      size={24}
                      color="#49454F"
                    />
                  )}
                  right={(p) => (
                    <Ionicons
                      name="chevron-forward"
                      size={24}
                      color="#49454F"
                    />
                  )}
                  onPress={() => {
                    router.push({
                      pathname: "/(team)/plan",
                      params: {
                        teamId: id,
                        role: team?.role || "MEMBER",
                        teamName: team?.name || "",
                      },
                    });
                  }}
                  style={{ paddingRight: 0, paddingLeft: 0 }}
                />

                <List.Item
                  title="Documents"
                  titleStyle={{ color: "#1D1B20", fontWeight: "400" }}
                  left={(p) => (
                    <Ionicons name="folder-open" size={24} color="#49454F" />
                  )}
                  right={(p) => (
                    <Ionicons
                      name="chevron-forward"
                      size={24}
                      color="#49454F"
                    />
                  )}
                  onPress={() => {
                    router.push({
                      pathname: "/(team)/teamDocument",
                      params: {
                        teamId: id,
                        role: team?.role || "MEMBER",
                        teamName: team?.name || "",
                      },
                    });
                  }}
                  style={{ paddingRight: 0, paddingLeft: 0 }}
                />

                <List.Item
                  title="Statistic"
                  titleStyle={{ color: "#1D1B20", fontWeight: "400" }}
                  left={(p) => (
                    <Ionicons name="stats-chart" size={24} color="#49454F" />
                  )}
                  right={(p) => (
                    <Ionicons
                      name="chevron-forward"
                      size={24}
                      color="#49454F"
                    />
                  )}
                  onPress={() => {
                    router.push({
                      pathname: "/(team)/statistic",
                      params: { teamId: id },
                    });
                  }}
                  style={{ paddingRight: 0, paddingLeft: 0 }}
                />

                {canManage && (
                  <List.Item
                    title="Recover"
                    titleStyle={{ color: "#1D1B20", fontWeight: "400" }}
                    left={(p) => (
                      <Ionicons name="reload" size={24} color="#49454F" />
                    )}
                    right={(p) => (
                      <Ionicons
                        name="chevron-forward"
                        size={24}
                        color="#49454F"
                      />
                    )}
                    onPress={() =>
                      router.push({
                        pathname: "/(team)/trash",
                        params: {
                          teamId: id,
                          role: team?.role || "MEMBER",
                        },
                      })
                    }
                    style={{ paddingRight: 0, paddingLeft: 0 }}
                  />
                )}
              </Card.Content>
            </Card>

            {/* Card 5: Section 3 - Notification, Leave, Delete */}
            <Card
              mode="contained"
              style={{
                marginTop: 10,
                borderRadius: 0,
                backgroundColor: "#F8F6F7",
              }}
            >
              <Card.Content
                style={{ paddingHorizontal: 10, paddingVertical: 12 }}
              >
                <List.Item
                  title="Notification settings"
                  titleStyle={{ color: "#1D1B20", fontWeight: "400" }}
                  left={(props) => (
                    <Ionicons name="notifications" size={24} color="#49454F" />
                  )}
                  right={(p) => (
                    <Ionicons
                      name="chevron-forward"
                      size={24}
                      color="#49454F"
                    />
                  )}
                  onPress={handleNotiSettings}
                  style={{ paddingRight: 0, paddingLeft: 0 }}
                />

                {/* All role) */}
                <List.Item
                  title="Leave team"
                  titleStyle={{ color: "#FF5F57", fontWeight: "600" }}
                  left={(p) => (
                    <Ionicons name="exit" size={24} color="#FF5F57" />
                  )}
                  right={(p) => (
                    <Ionicons
                      name="chevron-forward"
                      size={24}
                      color="#FF5F57"
                    />
                  )}
                  style={{ paddingRight: 0, paddingLeft: 0 }}
                  onPress={handleLeave}
                />

                {/* Delete team (owner-only) */}
                {isOwner && (
                  <List.Item
                    title="Delete team"
                    titleStyle={{ color: "#FF5F57", fontWeight: "600" }}
                    left={(p) => (
                      <Ionicons name="trash" size={24} color="#FF5F57" />
                    )}
                    right={(p) => (
                      <Ionicons
                        name="chevron-forward"
                        size={24}
                        color="#FF5F57"
                      />
                    )}
                    style={{ paddingRight: 0, paddingLeft: 0 }}
                    onPress={handleDelete}
                  />
                )}
              </Card.Content>
            </Card>
          </View>
        </ScrollView>
      </View>

      {/* QR bottom sheet */}
      <TeamQRSheet
        qrVisible={qrVisible}
        onClose={closeQR}
        onReset={handleResetQR}
        teamName={team?.name}
        qrBase64={qrBase64 ?? undefined}
        qrImage={
          qrBase64 ? { uri: `data:image/png;base64,${qrBase64}` } : undefined
        }
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
        title="Delete team?"
        message="Are you sure you want to delete this team?"
        confirmText="Delete"
        onConfirm={handleConfirmLDelete}
        onCancel={() => setDeleteModalVisible(false)}
      />
      <ErrorModal
        visible={errorModalVisible}
        title="Cannot leave team"
        message={errorMessage}
        confirmText="OK"
        onConfirm={() => setErrorModalVisible(false)}
      />

      <TeamNameModal
        visible={teamNameModalVisible}
        initialName={team.name}
        onCancel={() => setTeamNameModalVisible(false)}
        onSave={async (newName) => {
          if (!id || !isOwner) return;
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
    </>
  );
}
