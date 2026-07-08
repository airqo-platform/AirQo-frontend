import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

export const config = {
  BASE_URL: process.env.BASE_URL || 'http://localhost:3000',
  BROWSER: process.env.BROWSER || 'chrome',
  HEADLESS: process.env.HEADLESS !== 'false',
  IMPLICIT_WAIT: parseInt(process.env.IMPLICIT_WAIT || '10000', 10),
  PAGE_LOAD_TIMEOUT: parseInt(process.env.PAGE_LOAD_TIMEOUT || '30000', 10),
  SCREENSHOT_DIR:
    process.env.SCREENSHOT_DIR || path.resolve(__dirname, './screenshots'),
};
