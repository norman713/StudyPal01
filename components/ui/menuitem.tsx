import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type MenuItemProps = {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  danger?: boolean;
};

export function MenuItem({
    title,
    icon,
    onPress,
    danger
}: MenuItemProps) {
    const color = danger ? '#FF5F57' : '#49454F';

return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.6}
      onPress={onPress}
    >
      <View style={styles.left}>
        <Ionicons
          name={icon}
          size={22}
          color={color}
        />
        <Text style={[styles.title, { color }]}>
          {title}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color={danger ? '#FF4D4F' : '#999'}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 64,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9F7F6',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    marginLeft: 14,
    fontWeight: '500',
  },
});

