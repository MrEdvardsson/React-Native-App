import { useState } from "react";
import { router } from "expo-router";
import { View, TextInput, Button, Text, StyleSheet, TouchableOpacity, Keyboard } from "react-native";
import { fetchWeatherByCity } from "../../src/services/weatherApi";
import { WeatherSuccess } from "../../src/types/weather";

export default function SearchScreen() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<WeatherSuccess | null>(null);

  const handleSearch = async () => {
    if (!city.trim()) {
      alert("Ange en stad");
      return;
    }
    Keyboard.dismiss();

    try {
      const data = await fetchWeatherByCity(city);
      setWeather(data);
    } catch (err: any) {
      alert(err.message);
      setWeather(null);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Skriv stad..."
        value={city}
        onChangeText={setCity}
      />
      <Button title="Sök" onPress={handleSearch} />
      {weather && (
        <TouchableOpacity onPress={() => router.push({
          pathname: "/search/weeklySearch",
          params: {
            city: weather.name,
            lat: String(weather.coord.lat),
            lon: String(weather.coord.lon),
          },
        })
        }>
          <Text style={styles.result}>
            {weather.name}: {Math.round(weather.main.temp)}°C,{" "}
            {weather.weather[0].description}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#E0F2FF" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    width: "80%",
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  result: { marginTop: 20, fontSize: 20 },
});
