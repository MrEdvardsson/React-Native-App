import React, { useState } from 'react';
import { StyleSheet, View, Dimensions, Button } from 'react-native';
import MapView, { UrlTile, PROVIDER_GOOGLE } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

const API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;

const LAYERS = ['clouds_new', 'precipitation_new', 'wind_new', 'temp_new'];

const LAYER_NAMES: Record<WeatherLayer, string> = {
  clouds_new: 'Moln',
  precipitation_new: 'Regn',
  wind_new: 'Vind',
  temp_new: 'Temp',
};

type WeatherLayer = typeof LAYERS[number];

const Map: React.FC = () => {
  const [layer, setLayer] = useState<WeatherLayer>('clouds_new');

  const tileUrl = `https://tile.openweathermap.org/map/${layer}/{z}/{x}/{y}.png?appid=${API_KEY}&opacity=0.6`;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: 62.0,
          longitude: 15.0,
          latitudeDelta: 12.0,
          longitudeDelta: 12.0,
        }}
      >
        <UrlTile urlTemplate={tileUrl} maximumZ={19} flipY={false} zIndex={1} />
      </MapView>

      <View style={styles.buttonContainer}>
        {LAYERS.map((l) => (
          <View key={l} style={styles.button}>
            <Button title={LAYER_NAMES[l]} onPress={() => setLayer(l)} />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width,
    height,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 5,
    borderRadius: 8,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default Map;
