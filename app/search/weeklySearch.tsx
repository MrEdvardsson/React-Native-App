import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { fetchForecast5Days } from "../../src/services/weatherApi";

interface ForecastItem {
  dt: number;
  main: { temp: number; temp_min: number; temp_max: number };
  weather: { description: string; icon: string }[];
  dt_txt: string;
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
        const data = await fetchForecast5Days(Number(lat), Number(lon));
        console.log("Weekly params:", city, lat, lon);

        const grouped: Record<string, ForecastItem[]> = {};
        data.list.forEach((item: ForecastItem) => {
          const day = item.dt_txt.split(" ")[0];
          if (!grouped[day]) grouped[day] = [];
          grouped[day].push(item);
        });

        const summaries: DailySummary[] = Object.keys(grouped).map((day) => {
          const items = grouped[day];
          const temps = items.map((i) => i.main.temp);
          const min = Math.min(...temps);
          const max = Math.max(...temps);
          const desc = items[Math.floor(items.length / 2)].weather[0].description;
          return { date: day, min, max, description: desc };
        });

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
      <Text style={styles.title}>5 Dagars Prognos för {city}</Text>
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
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  day: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#ddd" },
  date: { fontWeight: "bold", fontSize: 16 },
});
