import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface PrayerTimes {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  Sunrise: string; // For Dhuha start (approx)
  [key: string]: string;
}

interface HijriDate {
  day: string;
  month: {
    number: number;
    en: string;
    ar: string;
  };
  year: string;
}

interface UsePrayerTimesResult {
  prayerTimes: PrayerTimes | null;
  hijriDate: HijriDate | null;
  isRamadan: boolean;
  loading: boolean;
  error: string | null;
  city: string;
}

export const usePrayerTimes = (): UsePrayerTimesResult => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [hijriDate, setHijriDate] = useState<HijriDate | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const CITY = 'Labuhan Batu'; // Or Rantau Prapat
  const COUNTRY = 'Indonesia';

  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        setLoading(true);
        const today = new Date();
        const dateStr = format(today, 'dd-MM-yyyy'); // Format required by some endpoints, but timingsByCity uses current date by default

        // Using Aladhan API
        // Method 20 is Kemenag RI (Ministry of Religious Affairs Indonesia) if available, otherwise standard
        const response = await fetch(
          `https://api.aladhan.com/v1/timingsByCity?city=${CITY}&country=${COUNTRY}&method=20`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch prayer times');
        }

        const data = await response.json();
        
        if (data.code === 200 && data.data) {
          setPrayerTimes(data.data.timings);
          setHijriDate(data.data.date.hijri);
        } else {
          throw new Error('Invalid data format from API');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPrayerTimes();
  }, []);

  const isRamadan = hijriDate?.month?.number === 9;

  return {
    prayerTimes,
    hijriDate,
    isRamadan,
    loading,
    error,
    city: CITY,
  };
};
