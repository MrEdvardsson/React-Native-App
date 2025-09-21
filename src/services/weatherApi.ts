const API_KEY = "DIN_API_KEY";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

export const fetchWeatherByCoords = async (lat: number, lon: number) => {
    const res = await fetch(`${BASE_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}&lang=se`);
    const data = await res.json();
    if (data.cod && data.cod !== 200) {
        throw new Error(data.message || "Kunde inte hämta väderdata");
    }
    return data;
};

export const fetchWeatherByCity = async (city: string) => {
    const res = await fetch(`${BASE_URL}?q=${city}&units=metric&appid=${API_KEY}&lang=se`);
    const data = await res.json();
    if (data.cod && data.cod !== 200) {
        throw new Error(data.message || "Kunde inte hämta väderdata");
    }
    return data;
};
