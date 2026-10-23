import { useCallback, useEffect, useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getShowHijri,
  HIJRI_PREFERENCE_EVENT,
  HIJRI_PREFERENCE_KEY,
  setShowHijri
} from '../utils/locale';

/**
 * Whether Hijri dates are shown next to Gregorian ones.
 * Stored per browser (localStorage); defaults to ON for Arabic only.
 */
const useHijriPreference = (): [boolean, (value: boolean) => void] => {
  const { i18n } = useTranslation();
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  useEffect(() => {
    const onChange = () => forceUpdate();
    const onStorage = (event: StorageEvent) => {
      if (event.key === HIJRI_PREFERENCE_KEY) forceUpdate();
    };
    window.addEventListener(HIJRI_PREFERENCE_EVENT, onChange);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(HIJRI_PREFERENCE_EVENT, onChange);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const setValue = useCallback((value: boolean) => setShowHijri(value), []);

  return [getShowHijri(i18n.language), setValue];
};

export default useHijriPreference;
