'use client';

import { createContext, useContext } from 'react';
import { FullSettingsWithTranslations } from '@/types/general';

const SettingsContext = createContext<FullSettingsWithTranslations | null>(null);

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('SettingsContext missing');
  return ctx;
};

export const SettingsProvider = ({
                                   settings,
                                   children,
                                 }: {
  settings: FullSettingsWithTranslations;
  children: React.ReactNode;
}) => (
  <SettingsContext.Provider value={settings}>
    {children}
  </SettingsContext.Provider>
);
