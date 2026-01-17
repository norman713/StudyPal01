import inviteApi, { Invitation } from "@/api/inviteApi";
import { useUnreadNotification } from "@/context/unreadNotificationContext";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function InvitationPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // store ID of item being processed
  const { clearUnread, unreadNotificationCount } = useUnreadNotification();

  useEffect(() => {
    fetchInvitations();
  }, []);

  useEffect(() => {
    if (unreadNotificationCount == 0) return;
    fetchInvitations();
  }, [unreadNotificationCount]);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const res = await inviteApi.getAll();
      console.log("[InviteApi.getAll] invitations:", res);
      setInvitations(res.invitations);
    } catch (err) {
      console.error("Failed to fetch invitations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (id: string, accept: boolean) => {
    try {
      setActionLoading(id);
      await inviteApi.reply(id, accept);
      // Remove from list
      setInvitations((prev) => prev.filter((inv) => inv.id !== id));
      Alert.alert(
        "Success",
        accept ? "Invitation accepted" : "Invitation declined"
      );
      clearUnread(1);
    } catch (err: any) {
      console.error("Reply error:", err);
      Alert.alert("Error", "Failed to process invitation");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#90717E" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Text className="ml-4 mt-3 text-[16px] font-PoppinsSemiBold">
        Invitation List
      </Text>
      <ScrollView className="px-4 mt-2 mb-20">
        {invitations.length === 0 ? (
          <Text className="text-center text-gray-400 mt-10">
            No invitations found.
          </Text>
        ) : (
          invitations.map((inv) => (
            <View
              key={inv.id}
              className="flex-row items-start rounded-lg p-3 mb-3 bg-white shadow-sm border border-gray-100"
            >
              {inv.inviterAvatarUrl ? (
                <Image
                  source={{ uri: inv.inviterAvatarUrl }}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <View className="w-12 h-12 rounded-full bg-[#6B4EFF] items-center justify-center">
                  <Text className="font-bold text-[#fff] text-lg">
                    {inv.inviterName?.charAt(0).toUpperCase() || "U"}
                  </Text>
                </View>
              )}

              <View className="ml-3 flex-1">
                <Text className="font-PoppinsSemiBold text-black text-[16px]">
                  Invitation to {inv.teamName}
                </Text>

                <Text className="text-[12px] text-[#92AAA5] mt-1">
                  {formatDate(inv.invitedAt)}
                </Text>

                <Text className="text-[13px] text-black mt-1 leading-[18px]">
                  <Text className="font-bold">{inv.inviterName}</Text> has
                  invited you to team "{inv.teamName}".
                </Text>

                <View className="flex-row gap-3 mt-3">
                  <TouchableOpacity
                    onPress={() => handleReply(inv.id, true)}
                    disabled={actionLoading === inv.id}
                    className="bg-[#90717E] flex-1 py-2 rounded-[100px] justify-center items-center"
                  >
                    {actionLoading === inv.id ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text className="text-white font-PoppinsRegular text-[15px]">
                        Accept
                      </Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleReply(inv.id, false)}
                    disabled={actionLoading === inv.id}
                    className="bg-[#B8C6B6] flex-1 py-2 rounded-[100px] justify-center items-center"
                  >
                    <Text className="text-[#0F0C0D] font-PoppinsRegular text-[15px]">
                      Decline
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
