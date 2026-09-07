import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text } from 'react-native';

export default function App() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="dark" />
      <Text accessibilityRole="header" style={styles.title}>What's Poppin</Text>
      <Text style={styles.notice}>Mobile app in development.</Text>
      <Text style={styles.body}>Event discovery and Find a Friend are not available in this build.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 80, paddingBottom: 40, backgroundColor: '#FFFFFF' },
  title: { color: '#000000', fontSize: 36, fontWeight: '700', marginBottom: 32 },
  notice: { color: '#000000', fontSize: 20, borderTopWidth: 1, borderTopColor: '#000000', paddingTop: 16, marginBottom: 16 },
  body: { color: '#000000', fontSize: 18 },
});
