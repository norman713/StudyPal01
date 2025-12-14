import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

interface EmptyStateProps {
  title?: string;
  subtitle?: string;
  imageSrc?: any;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryPress?: () => void;
  onSecondaryPress?: () => void;
}

/**
 * EmptyState Component
 * Component tái sử dụng cho các trường hợp empty state
 * Design: Giống HomeScreen trong folder "Create Scan and Team Pages"
 */
export default function EmptyState({
  title = "You haven't joined any team yet!",
  subtitle,
  imageSrc = require("@/assets/images/EmptyTeam.png"),
  primaryButtonText = "Create new team",
  secondaryButtonText = "Scan to join team",
  onPrimaryPress,
  onSecondaryPress,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {/* Empty State Image */}
      <View style={styles.imageContainer}>
        <Image source={imageSrc} style={styles.image} resizeMode="contain" />
      </View>

      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Subtitle (optional) */}
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {/* Primary Button */}
        {onPrimaryPress && (
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={onPrimaryPress}
          >
            <Text style={styles.primaryButtonText}>{primaryButtonText}</Text>
          </Pressable>
        )}

        {/* Secondary Button */}
        {onSecondaryPress && (
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={onSecondaryPress}
          >
            <Text style={styles.secondaryButtonText}>
              {secondaryButtonText}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingTop: 40,
    backgroundColor: "transparent",
  },
  imageContainer: {
    width: "100%",
    maxWidth: 350,
    aspectRatio: 1,
    marginBottom: 20,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 21,
    fontWeight: "600",
    color: "#0F0C0D",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 20,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 14,
    color: "#79747E",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
    paddingHorizontal: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
  },
  primaryButton: {
    backgroundColor: "#90717E",
  },
  secondaryButton: {
    backgroundColor: "#92AAA5",
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  primaryButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "400",
  },
  secondaryButtonText: {
    fontSize: 16,
    color: "#0F0C0D",
    fontWeight: "400",
  },
});
