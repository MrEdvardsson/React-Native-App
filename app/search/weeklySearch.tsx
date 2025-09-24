import { View, Text, StyleSheet } from "react-native";

export default function WeeklySearch() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Veckans väder</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold" },
});