import authApi from "@/api/authApi";
import Loading from "@/components/loading";
import { isValidEmail } from "@/utils/validator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuth, GoogleAuthProvider, signInWithCredential } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Buffer } from "buffer";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { jwtDecode } from 'jwt-decode';
import {
  BackHandler,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Button, TextInput } from "react-native-paper";
import ErrorModal from "../../components/modal/error";
import "../../global.css";
import { useUser } from "@/context/userContext";
import userApi from "@/api/userApi";
import deviceTokenApi from "@/api/deviceTokenApi";
import { useNotification } from "@/context/notificationContext";

// ===== Helper decode exp từ JWT (ms) =====
function getJwtExpMs(token: string): number | null {
  try {
    const [, payloadB64] = token.split(".");
    if (!payloadB64) return null;

    const b64 = payloadB64.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), "=");

    const json = JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
    return typeof json?.exp === "number" ? json.exp * 1000 : null; // exp(s) -> ms
  } catch {
    return null;
  }
}

// Keys for với axios interceptor
const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";
const EXP_KEY = "accessExpiresAt";

export default function LoginPage() {
  /**
   * Assets
   */
  const imageSource = require("../../assets/images/Reading.png");
  const ggIcon = require("../../assets/images/GoogleIcon.png");
  const navigation = useNavigation();

  // helpers (tuỳ chọn)
  const isTokenValid = (expStr?: string | null) => {
    if (!expStr) return true;
    const exp = Number(expStr);
    const now = Date.now();
    const LEEWAY_MS = 5_000;
    return exp > now + LEEWAY_MS;
  };
  //Hooks
  const router = useRouter();

  /**
   * States & Variables
   */
  const { setUser } = useUser();
  const { fcmToken } = useNotification();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [loginRequest, setLoginRequest] = useState({
    email: "",
    password: "",
  });

  //Effects

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [token, expStr] = await Promise.all([
          AsyncStorage.getItem(ACCESS_KEY),
          AsyncStorage.getItem(EXP_KEY),
        ]);

        if (token && isTokenValid(expStr) && !cancelled) {
          handleSaveUser(token);
          router.replace("/(team)/search");
        } else if (token && !isTokenValid(expStr)) {
          await AsyncStorage.multiRemove([ACCESS_KEY, REFRESH_KEY, EXP_KEY]);
        }
      } catch (_) {}
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    navigation.setOptions({ gestureEnabled: false });

    // disable hardware back (Android)
    const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => sub.remove();
  }, [navigation]);

  /**
   *  Handlers
   */
  const handleSaveUser = async(token: string) => {
    const decoded = jwtDecode<any>(token);
    const userId = decoded?.sub;
    if(userId){
      try{
        const user = await userApi.getUserById(userId);
        setUser(user);
        if(fcmToken){
          const mess = await deviceTokenApi.regisDeviceToken({ deviceToken: fcmToken, platform: "ANDROID" });
          if(!mess.success){
            throw new Error("Cannot register device token");
          }
        }
      }catch(error){
        console.error(error);
      }
    }
  }

  const handleForgotPassword = () => {
    router.push("/(auth)/(flow)/forgot");
  };

  const handleSignUp = () => {
    router.push("/(auth)/(flow)/register");
  };

  const handleLogin = async () => {
    setShowError(false);
    setErrorMessage(""); // reset
    setMessage({ title: "", description: "" });

    // Validate
    if (!email.trim() || !password.trim()) {
      setShowError(true);
      setErrorMessage("Please fill in both email and password.");
      return;
    }
    if (!isValidEmail(email.trim())) {
      setShowError(true);
      setErrorMessage("Invalid email format.");
      return;
    }

    setLoading(true);
    try {
      const { accessToken, refreshToken } = await authApi.login(
        email.trim(),
        password.trim()
      );

      // Calculate expiresAt từ JWT
      const expMs = getJwtExpMs(accessToken);
      await AsyncStorage.setItem(ACCESS_KEY, accessToken);
      await AsyncStorage.setItem(REFRESH_KEY, refreshToken);
      if (expMs) {
        await AsyncStorage.setItem(EXP_KEY, String(expMs));
      } else {
        await AsyncStorage.removeItem(EXP_KEY);
      }
      await handleSaveUser(accessToken);
      setShowError(false);
      setErrorMessage("");
      router.replace("/(team)/search");
    } catch (err: any) {
      const apiMessage =
        err?.response?.data?.message || "Email or password is incorrect.";
      setShowError(true);
      setErrorMessage(apiMessage);
    } finally {
      setLoading(false);
    }
  };

  async function googleLogin() {
    setShowError(false);
    setErrorMessage(""); 
    setMessage({ title: "", description: "" });

    setLoading(true);
    try{
      const auth = getAuth();
      GoogleSignin.configure({
        offlineAccess: false,
        webClientId: '541415516105-pfldjms5lhebobt435njrmq0lrrnb27o.apps.googleusercontent.com',
        scopes: ['profile', 'email']
      })
      
      GoogleSignin.hasPlayServices();
      const signInResult = await GoogleSignin.signIn();
      const idToken = signInResult.data?.idToken;
      const googleCredentials = GoogleAuthProvider.credential(idToken);
      const userCredentials = await signInWithCredential(auth, googleCredentials);
      const user = userCredentials.user;

      const firebaseIdToken = await user.getIdToken();
      if(firebaseIdToken){
        const { accessToken, refreshToken } = await authApi.gglogin("GOOGLE", firebaseIdToken);
        // Calculate expiresAt từ JWT
        const expMs = getJwtExpMs(accessToken);
        await AsyncStorage.setItem(ACCESS_KEY, accessToken);
        await AsyncStorage.setItem(REFRESH_KEY, refreshToken);
        if (expMs) {
          await AsyncStorage.setItem(EXP_KEY, String(expMs));
        } else {
          await AsyncStorage.removeItem(EXP_KEY);
        }
        await handleSaveUser(accessToken);
        setShowError(false);
        setErrorMessage("");
        router.replace("/(team)/search");
      }
      else{
        setShowError(true);
        setErrorMessage("Can't get user idToken");
      }
    }catch (err: any) {
      setShowError(true);
      setErrorMessage(err?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
      // showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={["#90717E", "#8C8C8C"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="bg-[#90717E]"
      >
        {/* Top section */}
        <View className="h-[30%] justify-center px-12 ">
          <Text className="text-white text-[51px] font-PoppinsSemiBold leading-[55px]">
            Hello !
          </Text>
          <Text className=" text-white font-PoppinsRegular text-[16px]">
            Welcome to StudyPal
          </Text>
        </View>

        {/* Image section */}
        <View className="absolute top-[20%] left-[45%] z-10">
          <Image
            source={imageSource}
            className="w-50 h-50"
            resizeMode="contain"
          />
        </View>

        {/* Bottom section */}
        <View className="bg-white  min-h-screen rounded-t-[50px] px-12 py-10 ">
          <Text className="text-[#90717E] font-PoppinsSemiBold text-[28px] mb-8">
            Login
          </Text>

          {/* Enter login input */}
          <View className="gap-7">
            <TextInput
              mode="outlined"
              label="Enter email"
              value={email}
              onChangeText={(email) => setEmail(email)}
              theme={{
                roundness: 30,
                colors: {
                  background: "#FFFFFF",
                },
              }}
            />
            <TextInput
              mode="outlined"
              label="Enter password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              theme={{
                roundness: 30,
                colors: {
                  background: "#FFFFFF",
                },
              }}
            />
          </View>
          <Pressable onPress={handleForgotPassword}>
            <Text className="font-PoppinsSemiBold text-[#90717E] text-right mt-7 text-[16px]">
              Forgot Password
            </Text>
          </Pressable>
          {/* Button section */}
          <View className="gap-2 py-6">
            <Button
              mode="contained"
              buttonColor="#90717E"
              contentStyle={{ height: 44 }}
              labelStyle={{
                fontSize: 16,
                fontFamily: "PoppinsRegular",
                color: "#fff",
              }}
              theme={{ roundness: 100 }}
              onPress={handleLogin}
            >
              Login
            </Button>

            {/* Divider */}
            <View className="flex-row items-center px-2">
              <View className="flex-1 h-[1px] bg-[#49454F]" />
              <Text className=" text-[#49454F] font-PoppinsRegular">
                Or login with
              </Text>
              <View className="flex-1 h-[1px] bg-[#49454F]" />
            </View>

            <Button
              mode="outlined"
              icon={() => (
                <Image
                  source={ggIcon}
                  style={{ width: 18, height: 18, marginRight: 10 }}
                />
              )}
              contentStyle={{ height: 44 }}
              labelStyle={{
                fontSize: 16,
                fontFamily: "PoppinsRegular",
                color: "#0F0C0D",
              }}
              theme={{ roundness: 100 }}
              onPress={() => googleLogin()}
            >
              Login with Google
            </Button>
          </View>

          {/* Sign up section */}
          <View className="flex-row justify-center mt-4">
            <Text className="text-[16px] text-[#000000] font-PoppinsRegular">
              Don’t have an account?{" "}
            </Text>
            <Pressable onPress={handleSignUp}>
              <Text className="text-[16px] text-[#90717E] font-PoppinsSemiBold">
                Sign up here
              </Text>
            </Pressable>
          </View>
        </View>

        {loading && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.3)",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
            }}
          >
            <Loading />
          </View>
        )}

        <ErrorModal
          visible={showError}
          title="Login Failed"
          message={errorMessage}
          confirmText="Cancel"
          onConfirm={() => setShowError(false)}
        />
      </LinearGradient>
    </ScrollView>
  );
}
