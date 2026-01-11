import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import Svg, { Circle } from "react-native-svg";

const ACCENT = "#90717E";

interface ProgressCircleProps {
  progress: number;
  size?: number;
}

export default function ProgressCircle({
  progress,
  size = 60,
}: ProgressCircleProps) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressValue = Math.min(Math.max(progress, 0), 100);
  const strokeDashoffset =
    circumference - (progressValue / 100) * circumference;

  return (
    <View style={[styles.progressContainer, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E3DBDF"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ACCENT}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      <View style={styles.progressTextContainer}>
        <Text style={styles.progressTextLarge}>{progress.toFixed(0)}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  progressContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  progressTextContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  progressTextLarge: {
    fontSize: 16,
    fontWeight: "700",
    color: ACCENT,
  },
});
