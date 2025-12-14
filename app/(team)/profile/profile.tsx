import { MenuItem } from "@/components/ui/menuitem";
import { useUser } from "@/context/userContext";
import { router, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Avatar, Card, IconButton, List, Text } from "react-native-paper";
import deviceTokenApi from "@/api/deviceTokenApi";
import { useNotification } from "@/context/notificationContext";
import QuestionModal from "@/components/modal/question";
import ErrorModal from "@/components/modal/error";
import authApi from "@/api/authApi";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ProfileScreenProps = {
  userId: string;
};

interface ErrorMessage {
  title: string,
  content: string
}
const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";
const EXP_KEY = "accessExpiresAt";

export default function ProfileScreen({ userId }: ProfileScreenProps) {
  // Mock data – sau này bạn có thể fetch từ API
  const { user, clearUser } = useUser();
  const { clearNotification, fcmToken } = useNotification();
  const [ showQuestion, setShowQuestion ] = useState(false);
  const [ showError, setShowError ] = useState(false);
  const [ error, setError ] = useState<ErrorMessage | null>(null);
  const router = useRouter();

  const menuItems = [
    {
      title: 'Change Profile',
      icon: 'cog',
      onPress: () => console.log('Profile'),
    },
    {
      title: 'Reset Password',
      icon: 'reload',
      onPress: () => console.log('Notifications'),
    },
    {
      title: 'Logout',
      icon: 'logout',
      onPress: () => setShowQuestion(true),
      danger: true,
    },
  ];

  async function logout() {
    try{
      setShowQuestion(false); 
      clearUser();
      if(fcmToken){
        const mess = await deviceTokenApi.delDeviceToken(fcmToken);
        console.log(1);
        if (mess.success){
          clearNotification();
        }else{
          throw new Error(mess.message);
        }
      }
      const logMess = await authApi.logout();
      if(logMess.success){
        await AsyncStorage.multiRemove([ACCESS_KEY, REFRESH_KEY, EXP_KEY]);
        router.replace("/(auth)/login");
      }else{
        throw new Error(logMess.message);
      }
    }catch(err: any){
      setShowError(true);
      setError({title: "Logout failed!", content: err?.response?.data?.message});
    }
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
      <View className="px-4 pb-4">
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

      <View className="px-4">
        <View className="px-4 py-4  bg-white">
        {menuItems.map((item, index) => (
          <MenuItem
            key={index}
            title={item.title}
            icon={item.icon as any}
            onPress={item.onPress}
            danger={item.danger}
          />
        ))}
        </View>
      </View>

      <QuestionModal
        visible={showQuestion}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="OK"
        onConfirm={() => logout()}
        onCancel={() => setShowQuestion(false)}
      />

      <ErrorModal
        visible={showError}
        title= {error?.title}
        message={error?.content}
        confirmText="Cancel"
        onConfirm={() => setShowError(false)}
      />
    </View>
  );
}
