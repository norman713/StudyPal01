import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type MenuItemProps = {
  title: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress?: () => void;
  danger?: boolean;
};

export function MenuItem({
  title,
  icon,
  onPress,
  danger,
}: MenuItemProps) {
  const color = danger ? '#FF5F57' : '#49454F';

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.6}
      onPress={onPress}
    >
      <View style={styles.left}>
        {icon && (
          <MaterialCommunityIcons
            name={icon}
            size={22}
            color={color}
            style={{ marginRight: 12 }}
          />
        )}

        <Text style={[styles.title, { color }]}>
          {title}
        </Text>
      </View>

      <MaterialCommunityIcons
        name="menu-right"
        size={20}
        color={color}
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
    backgroundColor: '#fff',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    width: '100%'
  },
  title: {
    fontSize: 16,
  },
});

