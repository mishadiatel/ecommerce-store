'use client'

import { useEffect } from 'react';

export default function Setup() {
  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
      document.body.classList.add('is-touch-device');
    }
  }, []);

  return null;
}
