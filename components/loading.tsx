import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedView = Animated.createAnimatedComponent(View);

type Props = {
  size?: number; // kích thước spinner (px)
  strokeWidth?: number; // độ dày vòng
  startColor?: string; // màu gradient đầu
  endColor?: string; // màu gradient cuối
  dashSpeedMs?: number; // tốc độ “stroke-dash” (ms)
  rotateSpeedMs?: number; // tốc độ quay (ms)
};

export default function Loading({
  size = 160,
  strokeWidth = 56,
  startColor = "#90717E",
  endColor = "#EADFE3",
  dashSpeedMs = 2100,
  rotateSpeedMs = 9700,
}: Props) {
  // progress cho dash (0 -> 1, lặp 1 chiều)
  const pDash = useSharedValue(0);
  // progress cho rotate (0 -> 1, lặp 1 chiều)
  const pRot = useSharedValue(0);

  useEffect(() => {
    pDash.value = withRepeat(
      withTiming(1, {
        duration: dashSpeedMs,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      false // ❗ 1 chiều (không alternate)
    );
    pRot.value = withRepeat(
      withTiming(1, { duration: rotateSpeedMs, easing: Easing.linear }),
      -1,
      false // ❗ 1 chiều (không alternate)
    );
  }, []);

  // Dash animation: 0% -> 50% -> 100% rồi loop về 0% (sẽ có "nhảy" nhẹ ở điểm lặp – đúng yêu cầu 1 chiều)
  const animatedProps = useAnimatedProps(() => {
    const dash1 = interpolate(pDash.value, [0, 0.5, 1], [1, 400, 800]);
    const dash2 = interpolate(pDash.value, [0, 0.5, 1], [800, 400, 1]);
    const dashOffset = interpolate(pDash.value, [0, 0.5, 1], [0, -200, -800]);
    return {
      strokeDasharray: [dash1, dash2] as unknown as string,
      strokeDashoffset: dashOffset,
    };
  });

  // Quay 0 -> 360 độ, loop 1 chiều
  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${pRot.value * 360}deg` }],
  }));

  return (
    <AnimatedView style={rotateStyle}>
      <Svg height={size} width={size} viewBox="0 0 800 800">
        <Defs>
          <LinearGradient id="ringGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={startColor} />
            <Stop offset="100%" stopColor={endColor} />
          </LinearGradient>
        </Defs>

        <AnimatedCircle
          animatedProps={animatedProps}
          cx="400"
          cy="400"
          r="200"
          stroke="url(#ringGrad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
    </AnimatedView>
  );
}
