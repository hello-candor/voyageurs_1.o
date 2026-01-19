
import React, { useState, useEffect, useRef } from 'react';
import { 
    CloudSun, CloudRain, Sun, Cloud, CloudLightning, 
    Snowflake, Wind, Droplets, Loader2, MapPin, Thermometer
} from 'lucide-react';

interface WeatherData {
    current: {
        temp: number;
        code: number;
        isDay: number;
        wind: number;
    };
    daily: {
        time: string[];
        code: number[];
        max: number[];
        min: number[];
    };
}

const WMO_CODES: Record<number, { label: string; icon: React.ElementType }> = {
    0: { label: 'Clear', icon: Sun },
    1: { label: 'Mainly Clear', icon: CloudSun },
    2: { label: 'Partly Cloudy', icon: CloudSun },
    3: { label: 'Overcast', icon: Cloud },
    45: { label: 'Fog', icon: Cloud },
    48: { label: 'Rime Fog', icon: Cloud },
    51: { label: 'Drizzle', icon: CloudRain },
    53: { label: 'Drizzle', icon: CloudRain },
    55: { label: 'Drizzle', icon: CloudRain },
    61: { label: 'Rain', icon: CloudRain },
    63: { label: 'Rain', icon: CloudRain },
    65: { label: 'Heavy Rain', icon: CloudRain },
    71: { label: 'Snow', icon: Snowflake },
    73: { label: 'Snow', icon: Snowflake },
    75: { label: 'Heavy Snow', icon: Snowflake },
    95: { label: 'Thunderstorm', icon: CloudLightning },
    96: { label: 'Thunderstorm', icon: CloudLightning },
    99: { label: 'Thunderstorm', icon: CloudLightning },
};

export const WeatherWidget: React.FC = () => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);
    const [error, setError] = useState(false);
    const [unit, setUnit] = useState<'fahrenheit' | 'celsius'>('fahrenheit');
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchWeather = async () => {
            setLoading(true);
            try {
                // Montpellier Coordinates: 43.6108, 3.8767
                // Units: Imperial by default (Fahrenheit, mph)
                const unitParams = unit === 'fahrenheit' 
                    ? '&temperature_unit=fahrenheit&wind_speed_unit=mph' 
                    : '&temperature_unit=celsius&wind_speed_unit=kmh';

                const res = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=43.6108&longitude=3.8767&current=temperature_2m,weather_code,is_day,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Europe%2FBerlin${unitParams}`
                );
                const data = await res.json();
                
                if (data.current && data.daily) {
                    setWeather({
                        current: {
                            temp: Math.round(data.current.temperature_2m),
                            code: data.current.weather_code,
                            isDay: data.current.is_day,
                            wind: Math.round(data.current.wind_speed_10m)
                        },
                        daily: {
                            time: data.daily.time,
                            code: data.daily.weather_code,
                            max: data.daily.temperature_2m_max,
                            min: data.daily.temperature_2m_min
                        }
                    });
                } else {
                    setError(true);
                }
            } catch (e) {
                console.error("Weather fetch failed", e);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
        // Refresh every 30 mins
        const interval = setInterval(fetchWeather, 30 * 60 * 1000);
        return () => clearInterval(interval);
    }, [unit]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setExpanded(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (error) return null;

    const CurrentIcon = weather ? (WMO_CODES[weather.current.code]?.icon || Cloud) : Loader2;
    const currentLabel = weather ? (WMO_CODES[weather.current.code]?.label || 'Unknown') : 'Loading...';
    const tempUnit = unit === 'fahrenheit' ? '°F' : '°C';
    const windUnit = unit === 'fahrenheit' ? 'mph' : 'km/h';

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Icon - Matching HubLayout Icon Styles */}
            <button 
                onClick={() => setExpanded(!expanded)}
                className={`
                    p-2 md:p-3 rounded-full transition-all duration-300
                    ${expanded ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}
                `}
                title="Current Weather"
            >
                {loading && !weather ? (
                    <Loader2 size={20} className="animate-spin" />
                ) : (
                    <div className="relative">
                        <CurrentIcon size={20} />
                        {weather && (
                            <span className="absolute -top-1 -right-2 text-[8px] font-bold bg-med-blue dark:bg-white dark:text-med-blue text-white px-1 rounded-full border border-slate-950 shadow-sm">
                                {weather.current.temp}°
                            </span>
                        )}
                    </div>
                )}
            </button>

            {/* Dropdown Menu */}
            {expanded && weather && (
                <div className="absolute top-full right-0 mt-4 w-72 bg-slate-950/95 backdrop-blur-3xl rounded-3xl p-6 shadow-2xl border border-white/10 animate-in fade-in slide-in-from-top-2 duration-200 z-[120] overflow-hidden">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                        <div>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                                <MapPin size={10} /> Montpellier
                            </div>
                            <h3 className="font-serif text-white text-xl">Current Conditions</h3>
                        </div>
                        <button 
                            onClick={() => setUnit(prev => prev === 'fahrenheit' ? 'celsius' : 'fahrenheit')}
                            className="flex items-center bg-white/10 hover:bg-white/20 rounded-xl px-2 py-1 text-white transition-colors"
                            title="Toggle Unit"
                        >
                            <span className={`text-xs font-bold ${unit === 'fahrenheit' ? 'text-white' : 'text-white/50'}`}>°F</span>
                            <span className="text-white/20 mx-1">/</span>
                            <span className={`text-xs font-bold ${unit === 'celsius' ? 'text-white' : 'text-white/50'}`}>°C</span>
                        </button>
                    </div>

                    {/* Current Detail */}
                    <div className="flex items-center gap-6 mb-6">
                        <div className="p-4 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl text-amber-400 shadow-inner ring-1 ring-white/10">
                            <CurrentIcon size={32} />
                        </div>
                        <div>
                            <div className="text-4xl font-serif font-bold text-white">
                                {weather.current.temp}{tempUnit}
                            </div>
                            <div className="text-xs text-white/60 font-medium uppercase tracking-wide mt-1">
                                {currentLabel}
                            </div>
                        </div>
                    </div>

                    {/* Wind / Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-white/5 p-3 rounded-xl flex flex-col items-center justify-center gap-1 border border-white/5">
                            <Wind size={16} className="text-blue-400" />
                            <span className="text-xs font-bold text-white">{weather.current.wind} {windUnit}</span>
                            <span className="text-[9px] text-white/40 uppercase tracking-wider">Wind</span>
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl flex flex-col items-center justify-center gap-1 border border-white/5">
                            <Droplets size={16} className="text-cyan-400" />
                            <span className="text-xs font-bold text-white">-- %</span>
                            <span className="text-[9px] text-white/40 uppercase tracking-wider">Humidity</span>
                        </div>
                    </div>

                    {/* Forecast */}
                    <div className="space-y-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">3-Day Forecast</p>
                        {weather.daily.time.slice(1, 4).map((dateStr, i) => {
                            const code = weather.daily.code[i + 1];
                            const DayIcon = WMO_CODES[code]?.icon || Cloud;
                            const date = new Date(dateStr);
                            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

                            return (
                                <div key={dateStr} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold text-white/60 w-8">{dayName}</span>
                                        <DayIcon size={16} className="text-white" />
                                    </div>
                                    <div className="flex gap-2 text-xs font-mono">
                                        <span className="font-bold text-white">{Math.round(weather.daily.max[i+1])}°</span>
                                        <span className="text-white/40">{Math.round(weather.daily.min[i+1])}°</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
