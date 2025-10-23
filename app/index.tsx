import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import * as Location from "expo-location";
import * as Device from "expo-device";
import { Magnetometer } from "expo-sensors";
import { fetchWeatherByCoords } from "../src/services/weatherApi";
import { WeatherSuccess } from "../src/types/weather";

export default function HomeScreen() {
  const [weather, setWeather] = useState<WeatherSuccess | null>(null);
  const [loading, setLoading] = useState(true);
  const [heading, setHeading] = useState<number | null>(null);
  const [rotation] = useState(new Animated.Value(0));
  const [infoVisible, setInfoVisible] = useState(false);

  // Hämta väder
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          alert("Behörighet nekad");
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const data = await fetchWeatherByCoords(
          location.coords.latitude,
          location.coords.longitude
        );
        setWeather(data);
      } catch (err: any) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Kompass
  useEffect(() => {
    const subscription = Magnetometer.addListener((data) => {
      const angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
      const fixedAngle = (angle + 360) % 360;
      setHeading(fixedAngle);

      Animated.timing(rotation, {
        toValue: fixedAngle,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });

    Magnetometer.setUpdateInterval(500);
    return () => subscription.remove();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      {/* Info-knapp uppe till höger */}
      <TouchableOpacity
        style={styles.infoButton}
        onPress={() => setInfoVisible(true)}
      >
        <Text style={styles.infoText}>ℹ️</Text>
      </TouchableOpacity>

      {/* Modal med enhetsinfo */}
      <Modal visible={infoVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>App Information</Text>
            <Text style={styles.modalText}>Model: {Device.modelName}</Text>
            <Text style={styles.modalText}>OS: {Device.osName} {Device.osVersion}</Text>
            <Text style={styles.modalText}>Brand: {Device.brand}</Text>
            <Text style={styles.modalText}>Design Name: {Device.designName}</Text>
            <Pressable
              style={styles.closeButton}
              onPress={() => setInfoVisible(false)}
            >
              <Text style={styles.closeText}>Stäng</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {weather ? (
        <>
          <Text style={styles.city}>
            {weather.name}, {weather.sys.country}
          </Text>
          <Text style={styles.temp}>{Math.round(weather.main.temp)}°C</Text>
          <Text style={styles.description}>{weather.weather[0].description}</Text>
          <Text style={styles.details}>
            Känns som: {Math.round(weather.main.feels_like)}°C
            {"\n"}Vind: {weather.wind.speed} m/s
            {"\n"}Moln: {weather.clouds.all}%
          </Text>
        </>
      ) : (
        <Text>Ingen väderdata</Text>
      )}

      {/* Kompass längst ner */}
      <View style={styles.compassContainer}>
        <Animated.View
          style={[styles.arrow, { transform: [{ rotate: rotateInterpolate }] }]}
        >
          <Text style={styles.arrowText}>↑</Text>
        </Animated.View>
        <Text style={styles.headingText}>
          {heading ? `${heading.toFixed(0)}°` : "Laddar kompass..."}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E0F2FF",
  },
  infoButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 20,
    padding: 6,
  },
  infoText: {
    fontSize: 20,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 10 },
  modalText: { fontSize: 14, marginVertical: 2 },
  closeButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 15,
  },
  closeText: { color: "#fff", fontWeight: "600" },
  city: { fontSize: 28, fontWeight: "600", marginBottom: 10 },
  temp: { fontSize: 48, fontWeight: "bold" },
  description: { fontSize: 20, textTransform: "capitalize" },
  details: {
    fontSize: 12,
    margin: 10,
    paddingTop: 10,
    textAlign: "center",
  },
  compassContainer: {
    position: "absolute",
    bottom: 40,
    alignItems: "center",
  },
  arrow: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  arrowText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#333",
  },
  headingText: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "500",
  },
});
