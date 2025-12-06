// This file provides browser-compatible alternatives to Node.js modules

// Mock for the 'path' module
export const path = {
  join: (...paths: string[]): string => {
    return paths.join('/').replace(/\/+/g, '/');
  },
  resolve: (...paths: string[]): string => {
    return paths.join('/').replace(/\/+/g, '/');
  }
};

// Mock for the 'fs' module
export const fs = {
  existsSync: (path: string): boolean => {
    // In browser, we'll assume directories exist
    return true;
  },
  mkdirSync: (path: string, options?: { recursive: boolean }): void => {
    // No-op in browser
    return;
  }
};

// Mock for process.env
export const processEnv = {
  APPDATA: '',
  HOME: '',
  platform: 'browser'
};
