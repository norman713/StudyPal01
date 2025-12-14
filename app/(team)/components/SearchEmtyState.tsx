import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

interface SearchEmptyStateProps {
  searchQuery?: string;
  message?: string;
}

/**
 * SearchEmptyState Component
 * Hiển thị khi search không tìm thấy kết quả
 */
export default function SearchEmptyState({
  searchQuery,
  message = "No teams found",
}: SearchEmptyStateProps) {
  return (
    <View style={styles.container}>
      {/* Search Empty Image - kính đọc sách */}
      <View style={styles.imageContainer}>
        <Image
          source={require("@/assets/images/Reading.png")}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* Message */}
      <Text style={styles.title}>
        {searchQuery ? `No results for "${searchQuery}"` : message}
      </Text>

      <Text style={styles.subtitle}>
        Try searching with different keywords or check your spelling
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingTop: 60,
    backgroundColor: "transparent",
  },
  imageContainer: {
    width: "100%",
    maxWidth: 280,
    aspectRatio: 1,
    marginBottom: 24,
    opacity: 0.8,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F0C0D",
    textAlign: "center",
    marginBottom: 12,
    paddingHorizontal: 16,
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 14,
    color: "#79747E",
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 20,
  },
});
