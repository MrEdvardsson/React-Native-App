import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { fetchForecast16Days } from "../../src/services/weatherApi";

interface DailyForecast {
  dt: number;
  temp: { min: number; max: number; day: number };
  weather: { description: string; icon: string }[];
}

export default function WeeklySearch() {
  const { city, lat, lon } = useLocalSearchParams();
  const [forecast, setForecast] = useState<DailyForecast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (!lat || !lon) return;
        const data = await fetchForecast16Days(Number(lat), Number(lon));
        setForecast(data.list);
      } catch (err: any) {
        console.error(err);
        alert("Misslyckades att hämta prognos");
      } finally {
        setLoading(false);
      }
    })();
  }, [lat, lon]);

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>16-dagars prognos för {city}</Text>
      <FlatList
        data={forecast}
        keyExtractor={(item) => String(item.dt)}
        renderItem={({ item }) => (
          <View style={styles.day}>
            <Text style={styles.date}>
              {new Date(item.dt * 1000).toLocaleDateString("sv-SE", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </Text>
            <Text>
              {Math.round(item.temp.min)}°C / {Math.round(item.temp.max)}°C
            </Text>
            <Text>{item.weather[0].description}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  day: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#ddd" },
  date: { fontWeight: "bold", fontSize: 16 },
});
