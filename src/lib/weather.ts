import type { Weather } from "./ai/prompts";

// WMO weather interpretation codes used by Open-Meteo.
function describe(code: number): string {
  if (code === 0) return "clear sky";
  if (code <= 2) return "partly cloudy";
  if (code === 3) return "overcast";
  if (code === 45 || code === 48) return "foggy";
  if (code >= 51 && code <= 57) return "drizzle";
  if (code >= 61 && code <= 67) return "rain";
  if (code >= 71 && code <= 77) return "snow";
  if (code >= 80 && code <= 82) return "rain showers";
  if (code === 85 || code === 86) return "snow showers";
  if (code >= 95) return "thunderstorm";
  return "mixed weather";
}

/**
 * Current local weather from Open-Meteo (free, open data, no API key).
 * Coordinates are rounded to ~1 km and never stored.
 */
export async function fetchLocalWeather(): Promise<Weather> {
  if (!("geolocation" in navigator)) throw new Error("Location isn't available in this browser.");
  const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      maximumAge: 30 * 60_000,
      timeout: 10_000,
    }),
  );
  const lat = pos.coords.latitude.toFixed(2);
  const lon = pos.coords.longitude.toFixed(2);
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day`,
  );
  if (!res.ok) throw new Error("Couldn't fetch the weather.");
  const json = (await res.json()) as {
    current: { temperature_2m: number; weather_code: number; is_day: number };
  };
  return {
    tempC: json.current.temperature_2m,
    description: describe(json.current.weather_code),
    isDay: json.current.is_day === 1,
  };
}
