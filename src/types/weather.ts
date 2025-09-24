export interface WeatherSuccess {
    cod: number;
    name: string;
    sys: {
        country: string;
    };
    main: {
        temp: number;
        feels_like: number;
        temp_min: number;
        temp_max: number;
        pressure: number;
        humidity: number;
    };
    weather: {
        id: number;
        main: string;
        description: string;
        icon: string;
    }[];
}

export interface WeatherError {
    cod: string | number;
    message: string;
}

export type WeatherResponse = WeatherSuccess | WeatherError;
