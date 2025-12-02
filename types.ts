import React from 'react';

export interface GeneratedImage {
  id: string;
  dataUrl: string; // Base64 or URL
  prompt: string;
  timestamp: number;
}

export enum Category {
  ANIMALS = 'Hewan Lucu',
  FRUITS = 'Buah & Sayur',
  VEHICLES = 'Kendaraan',
  ISLAMIC = 'Tema Islami',
  NATURE = 'Alam',
  NUMBERS = 'Huruf & Angka'
}

export interface PromptOption {
  label: string;
  value: string;
  icon: React.ReactNode;
}