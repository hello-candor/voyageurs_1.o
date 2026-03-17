
import React, { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, Loader2 } from 'lucide-react';

const WEATHER_ICONS: { [key: string]: React.ReactElement } = {
    "clear sky": <Sun size={20} className="text-amber-400" />,
    "few clouds": <Cloud size={20} className="text-slate-400" />,
    "scattered clouds": <Cloud size={20} className="text-slate-400" />,
    "broken clouds": <Cloud size={20} className="text-slate-400" />,
    "shower rain": <CloudRain size={20} className="text-blue-400" />,
    "rain": <CloudRain size={20} className="text-blue-400" />,
    "thunderstorm": <CloudRain size={20} className="text-blue-400" />,
    "snow": <CloudSnow size={20} className="text-slate-800 dark:text-white" />,
    "mist": <Cloud size={20} className="text-slate-400" />,
};

export const WeatherWidget: React.FC = () => {
    const [weather, setWeather] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const response = await fetch('/api/weather?city=Montpellier');
                if (!response.ok) {
                    throw new Error('Weather data not available');
                }
                const data = await response.json();
                setWeather(data);
            } catch (error) {
                console.error("Failed to fetch weather", error);
                setWeather(null); // Explicitly set to null on error
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
    }, []);

    const renderContent = () => {
        if (loading) {
            return <Loader2 size={16} className="animate-spin" />;
        }

        if (!weather || !weather.main) {
            return <span className="text-xs">N/A</span>;
        }

        const condition = weather.weather[0].description;
        const Icon = WEATHER_ICONS[condition] || <Sun size={20} />;

        return (
            <>
                {Icon}
                <span className="text-sm font-bold">{Math.round(weather.main.temp)}°C</span>
            </>
        );
    };

    return (
        <div className="flex items-center justify-center gap-2 text-slate-800 dark:text-white/80 bg-slate-900/5 dark:bg-white/5 hover:bg-slate-900/10 dark:hover:bg-white/10 px-3 py-1.5 rounded-full border border-slate-900/10 dark:border-white/10 backdrop-blur-md transition-all cursor-default min-w-[60px]">
            {renderContent()}
        </div>
    );
};
