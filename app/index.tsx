import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Button } from "react-native";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { fetchWeatherByCoords } from "../src/services/weatherApi";
import { WeatherSuccess } from "../src/types/weather";

export default function HomeScreen() {
  const [weather, setWeather] = useState<WeatherSuccess | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          alert("Behörighet nekad");
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const data = await fetchWeatherByCoords(location.coords.latitude, location.coords.longitude);
        setWeather(data);
      } catch (err: any) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.container}>
      {weather ? (
        <>
          <Text style={styles.temp}>{Math.round(weather.main.temp)}°C</Text>
          <Text>{weather.weather[0].description}</Text>
        </>
      ) : (
        <Text>Ingen väderdata</Text>
      )}
      <Button title="Sök stad" onPress={() => router.push("/search")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  temp: { fontSize: 48, fontWeight: "bold" },
});
