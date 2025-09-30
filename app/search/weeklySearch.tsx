import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { fetchForecast16Days } from "../../src/services/weatherApi";

interface ForecastItem {
  dt: number;
  temp: { day: number; min: number; max: number };
  weather: { description: string; icon: string }[];
}

interface DailySummary {
  date: string;
  min: number;
  max: number;
  description: string;
}

export default function WeeklySearch() {
  const { city, lat, lon } = useLocalSearchParams();
  const [forecast, setForecast] = useState<DailySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (!lat || !lon) return;
        const data = await fetchForecast16Days(Number(lat), Number(lon));

        const summaries: DailySummary[] = data.list.map((item: ForecastItem) => ({
          date: new Date(item.dt * 1000).toISOString().split("T")[0],
          min: item.temp.min,
          max: item.temp.max,
          description: item.weather[0].description,
        }));

        setForecast(summaries);
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
        keyExtractor={(item) => item.date}
        renderItem={({ item }) => (
          <View style={styles.day}>
            <Text style={styles.date}>
              {new Date(item.date).toLocaleDateString("sv-SE", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </Text>
            <Text>
              {Math.round(item.min)}°C / {Math.round(item.max)}°C
            </Text>
            <Text>{item.description}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  day: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#ddd" },
  date: { fontWeight: "bold", fontSize: 16 },
});
