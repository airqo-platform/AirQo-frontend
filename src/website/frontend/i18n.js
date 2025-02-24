import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import EnglishLocale from 'locales/en/translation'
import FrenchLocale from 'locales/fr/translation'

const languages = ['en', 'fr'];
i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'en',
        lng: 'en',
        whitelist: languages,
        resources: {
            en: {
                translation: EnglishLocale
            },
            fr: {
                translation: FrenchLocale
            }
        }
    })

export default i18n;