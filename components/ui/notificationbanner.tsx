import { useInAppNotification } from '@/context/inAppNotificationContext';
import { View, Text, StyleSheet } from 'react-native';


export function NotificationBanner() {
  const { message } = useInAppNotification();

  if (!message) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{message.title}</Text>
      <Text style={styles.body}>{message.body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 30,
    left: 0,
    width: '100%',
    backgroundColor: '#F8F6F7',
    borderRadius: 10,
    padding: 12,
    zIndex: 999,

    elevation: 6,
  },
  title: {
    color: '#0F0C0D',
    fontWeight: '600',
  },
  body: {
    color: '#0F0C0D',
    marginTop: 2,
  },
});
