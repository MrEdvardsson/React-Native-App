import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
  Pressable,
} from "react-native";
import * as Location from "expo-location";
import { groupBy } from "lodash";
import { fetchForecast5Days } from "../src/services/weatherApi";
import { ForecastItem } from "../src/types/weather";

interface DailySummary {
  date: string;
  min: number;
  max: number;
  description: string;
  icon?: string;
  details: ForecastItem[];
}

export default function Weekly() {
  const [loading, setLoading] = useState(true);
  const [forecast, setForecast] = useState<DailySummary[]>([]);
  const [selectedDay, setSelectedDay] = useState<DailySummary | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Behörighet nekad", "Appen behöver platsbehörighet för att visa väder.");
          setLoading(false);
          return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        const lat = loc.coords.latitude;
        const lon = loc.coords.longitude;

        const data = await fetchForecast5Days(lat, lon);

        const grouped = groupBy(data.list, (item: ForecastItem) => item.dt_txt.split(" ")[0]);

        const allDates = Object.keys(grouped).sort();

        const summaries: DailySummary[] = allDates.map((day) => {
          const items = grouped[day];
          const temps = items.map((i) => i.main.temp);
          const min = Math.min(...temps);
          const max = Math.max(...temps);

          let midItem = items.find((i) => i.dt_txt.includes("12:00:00"));
          if (!midItem) midItem = items[Math.floor(items.length / 2)];

          return {
            date: day,
            min,
            max,
            description: midItem?.weather[0].description ?? "",
            icon: midItem?.weather[0].icon,
            details: items,
          };
        });

        setForecast(summaries);
      } catch (err: any) {
        console.error("Weekly error:", err);
        Alert.alert("Fel", "Misslyckades att hämta prognos");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>5-dagars prognos</Text>
      <FlatList
        data={forecast}
        keyExtractor={(item) => item.date}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.day} onPress={() => setSelectedDay(item)}>
            <Text style={styles.date}>
              {new Date(item.date).toLocaleDateString("sv-SE", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </Text>
            <View style={styles.row}>
              <View>
                <Text style={styles.temp}>
                  {Math.round(item.min)}°C / {Math.round(item.max)}°C
                </Text>
                <Text>{item.description}</Text>
              </View>
            </View>
            <Text style={styles.chevron}>show more</Text>
          </TouchableOpacity>
        )}
      />

      <Modal visible={!!selectedDay} animationType="slide" transparent={false}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            Prognos för{" "}
            {selectedDay &&
              new Date(selectedDay.date).toLocaleDateString("sv-SE", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
          </Text>
          <FlatList
            data={selectedDay?.details || []}
            keyExtractor={(item) => item.dt.toString()}
            renderItem={({ item }) => (
              <View style={styles.hourRow}>
                <Text style={styles.hour}>
                  {new Date(item.dt_txt).toLocaleTimeString("sv-SE", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
                <Text style={styles.temp}>{Math.round(item.main.temp)}°C </Text>
                <Text>{item.weather[0].description}</Text>
              </View>
            )}
          />
          <Pressable style={styles.closeBtn} onPress={() => setSelectedDay(null)}>
            <Text style={styles.closeText}>Stäng</Text>
          </Pressable>
        </View>
      </Modal>
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
  row: { flexDirection: "row", alignItems: "center" },
  temp: { fontSize: 16, fontWeight: "600" },
  chevron: { fontSize: 14, color: "#999" },

  // Modal
  modalContainer: { flex: 1, padding: 20, backgroundColor: "#fff" },
  modalTitle: { fontSize: 22, fontWeight: "700", marginBottom: 20, textAlign: "center" },
  hourRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 30,
  },
  hour: { width: 60, fontWeight: "600" },
  iconSmall: { width: 36, height: 36, marginRight: 10 },
  closeBtn: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  closeText: { color: "#fff", fontWeight: "700" },
});
