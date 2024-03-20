const fs = require('fs');

const englishTranslationFilePath = 'frontend/locales/en/translation.json';
const frenchTranslationFilePath = 'frontend/locales/fr/translation.json';
const englishData = JSON.parse(fs.readFileSync(englishTranslationFilePath, 'utf8'));
const frenchData = JSON.parse(fs.readFileSync(frenchTranslationFilePath, 'utf8'));

describe('English translation', () => {
    it('should have expected structure', () => {
        expect(englishData).toHaveProperty('navbar');
    });
})

describe('French translation', () => {
    it('should have expected structure', () => {
        expect(frenchData).toHaveProperty('navbar');
    });
})

it('should have a "navbar" with the expected structure', () => {
    expect(englishData.navbar).toEqual({
        products: expect.objectContaining({
            title: expect.any(String),
            subnav: expect.objectContaining({
                monitor: expect.objectContaining({
                    name: expect.any(String),
                    desc: expect.any(String),
                }),
                dashboard: expect.objectContaining({
                    name: expect.any(String),
                    desc: expect.any(String),
                }),
                mobileapp: expect.objectContaining({
                    name: expect.any(String),
                    desc: expect.any(String),
                }),
                api: expect.objectContaining({
                    name: expect.any(String),
                    desc: expect.any(String),
                }),
                calibrate: expect.objectContaining({
                    name: expect.any(String),
                    desc: expect.any(String),
                }),
            }),
        }),
        solutions: expect.objectContaining({
            title: expect.any(String),
            subnav: expect.objectContaining({
                cities: expect.objectContaining({
                    name: expect.any(String),
                    desc: expect.any(String),
                }),
                communities: expect.objectContaining({
                    name: expect.any(String),
                    desc: expect.any(String),
                }),
                research: expect.objectContaining({
                    name: expect.any(String),
                    desc: expect.any(String),
                }),
            }),
        }),
        about: expect.objectContaining({
            title: expect.any(String),
            subnav: expect.objectContaining({
                aboutUs: expect.any(String),
                cleanAir: expect.any(String),
                events: expect.any(String),
                resources: expect.any(String),
                press: expect.any(String),
                careers: expect.any(String),
                contact: expect.any(String),
            }),
        }),
        getInvolved: expect.any(String),
        exploreData: expect.any(String),
    })
})