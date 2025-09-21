import { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet } from "react-native";
import { fetchWeatherByCity } from "../src/services/weatherApi";
import { WeatherSuccess } from "../src/types/weather";

export default function SearchScreen() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<WeatherSuccess | null>(null);

  const handleSearch = async () => {
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
        <Text style={styles.result}>
          {weather.name}: {Math.round(weather.main.temp)}°C
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  input: { borderWidth: 1, padding: 10, width: "80%", marginBottom: 20 },
  result: { marginTop: 20, fontSize: 20 },
});
