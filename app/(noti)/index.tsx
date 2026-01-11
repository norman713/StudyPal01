import ErrorModal from "@/components/modal/error";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Checkbox, IconButton } from "react-native-paper";
import notificationApi, {
  NotificationItem as ApiNotification,
} from "../../api/notiApi";

interface NotificationItem extends ApiNotification {
  type: "expired" | "overdue";
  checked: boolean;
}

export default function NotificationPage() {
  // State
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  //fetch api
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationApi.getAll();

      const mapped: NotificationItem[] = res.notifications.map((n) => ({
        ...n,
        type: n.content.includes("will be expired") ? "overdue" : "expired",
        checked: false,
        read: n.isRead,
      }));

      setNotifications(mapped);
    } catch (err) {
      console.error("❌ [fetchNotifications] Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Checkbox logic

  const handleMarkRead = async () => {
    try {
      const idsToMark = notifications.filter((n) => n.checked).map((n) => n.id);

      if (idsToMark.length === 0) return;

      setLoading(true);

      await notificationApi.markManyAsRead(idsToMark);

      // 🔥 fetch lại ngay để sync với backend
      await fetchNotifications();
    } catch (err: any) {
      const apiMessage =
        err?.response?.data?.message ?? "Something went wrong.";

      setErrorMessage(apiMessage);
      setErrorVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const allChecked = notifications.every((n) => n.checked);
  const someChecked = notifications.some((n) => n.checked);

  const toggleAll = () => {
    const newValue = !allChecked;
    setNotifications((prev) => prev.map((n) => ({ ...n, checked: newValue })));
  };

  const toggleOne = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, checked: !n.checked } : n))
    );
  };

  // handlers
  const handleDelete = async () => {
    try {
      const idsToDelete = notifications
        .filter((n) => n.checked)
        .map((n) => n.id);

      if (idsToDelete.length === 0) return;

      setLoading(true);
      await notificationApi.deleteMany(idsToDelete);
      setNotifications((prev) =>
        prev.filter((n) => !idsToDelete.includes(n.id))
      );
    } catch (err) {
      console.error("[handleDelete] Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // 🔹 UI Config theo type
  // ==============================
  const typeConfigs = {
    overdue: {
      icon: require("../../assets/images/overdue.png"),
    },
    expired: {
      icon: require("../../assets/images/expired.png"),
    },
  };

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-4 mt-4">
        <View className="flex-row items-center">
          <Checkbox.Android
            status={
              allChecked
                ? "checked"
                : someChecked
                  ? "indeterminate"
                  : "unchecked"
            }
            onPress={toggleAll}
            color="#90717E"
            uncheckedColor="#7E9181"
          />
          <Text className="font-PoppinsSemiBold text-[16px]">
            Notification List
          </Text>
        </View>

        <View className="flex-row items-center">
          <IconButton
            icon="delete"
            iconColor="#D22B2B"
            onPress={handleDelete}
          />
          <IconButton
            icon="email-outline"
            iconColor="#90717E"
            onPress={handleMarkRead}
          />
        </View>
      </View>

      {/* notidication list*/}
      <ScrollView className="px-1 mb-20 mt-2">
        {loading ? (
          <Text className="text-center mt-10 text-gray-500">Loading...</Text>
        ) : notifications.length === 0 ? (
          <Text className="text-center text-gray-400 mt-8">
            No notifications available.
          </Text>
        ) : (
          notifications.map((n) => {
            const config = typeConfigs[n.type];
            if (!config) return null;

            const date = new Date(n.createdAt).toLocaleString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <TouchableOpacity
                key={n.id}
                activeOpacity={0.8}
                onPress={() => toggleOne(n.id)}
                className={`relative flex-row items-start p-3 mb-3 rounded-lg ${
                  n.isRead ? "bg-[#F1EFF1]" : "bg-[#fff]"
                }`}
              >
                {/* Checkbox */}
                <Checkbox.Android
                  status={n.checked ? "checked" : "unchecked"}
                  onPress={() => toggleOne(n.id)}
                  color="#90717E"
                  uncheckedColor="#7E9181"
                />

                {/* Icon + content */}
                {n.subject === "TEAM" ? (
                  n.imageUrl ? (
                    <Image
                      source={{ uri: n.imageUrl }}
                      className="w-12 h-12 ml-2 rounded-full"
                    />
                  ) : (
                    <View className="w-12 h-12 ml-2 rounded-full bg-[#6B4EFF] items-center justify-center">
                      <MaterialCommunityIcons
                        name="account-group"
                        size={26}
                        color="white"
                      />
                    </View>
                  )
                ) : (
                  // Non-TEAM → icon theo type
                  <Image source={config.icon} className="w-10 h-10 ml-2" />
                )}

                <View className="ml-3 flex-1">
                  <Text className="font-semibold text-black text-[16px]">
                    {n.title}
                  </Text>
                  <Text className="text-[13px] text-[#92AAA5] mt-1">
                    {date}
                  </Text>
                  <Text className="text-[13px] text-black mt-1">
                    {n.content}
                  </Text>
                </View>

                {/* tick if read */}
                {n.isRead && (
                  <View className="absolute top-2 right-2">
                    <MaterialCommunityIcons
                      name="check"
                      size={18}
                      color="#90717E"
                    />
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <ErrorModal
        visible={errorVisible}
        message={errorMessage}
        onConfirm={() => setErrorVisible(false)}
      />
    </View>
  );
}
