// Clima vía Open-Meteo (gratis, sin API key).
// https://open-meteo.com/en/docs

export interface Weather {
  temperatureC: number;
  precipitationProbability: number; // 0-100, próxima hora
  weatherCode: number; // código WMO
  isRaining: boolean;
}

export async function getWeather(lat: number, lon: number): Promise<Weather> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set('current', 'temperature_2m,precipitation,weather_code');
  url.searchParams.set('hourly', 'precipitation_probability');
  url.searchParams.set('forecast_days', '1');

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('No se pudo obtener el clima desde Open-Meteo');
  }

  const data = (await res.json()) as {
    current?: { temperature_2m?: number; precipitation?: number; weather_code?: number };
    hourly?: { precipitation_probability?: number[] };
  };

  return {
    temperatureC: data.current?.temperature_2m ?? 0,
    precipitationProbability: data.hourly?.precipitation_probability?.[0] ?? 0,
    weatherCode: data.current?.weather_code ?? 0,
    isRaining: (data.current?.precipitation ?? 0) > 0,
  };
}
