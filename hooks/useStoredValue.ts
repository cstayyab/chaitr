import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function useStoredValue<T>(storageKey: string, initialValue?: T) {
  const STORAGE_KEY = storageKey;
  const [value, setValue] = useState<T | undefined>(initialValue);
  const [loading, setLoading] = useState(true);

  const fetchValue = useCallback(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((storedValue) => {
        if (storedValue !== null) {
          setValue(JSON.parse(storedValue));
        }
      })
      .finally(() => setLoading(false));
  }, [STORAGE_KEY]);

  useEffect(() => {
    fetchValue();
  }, []);

  const saveValue = async (newValue: T) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newValue));
    setValue(newValue);
  };

  return { value, setValue: saveValue, loading, forceFetch: fetchValue };
}
