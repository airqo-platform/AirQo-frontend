# How to Translate Website content to different languages
This is how language translation is being handled in this website application.

The packages being used for internationalisation are:
- `i18next`
- `i18next-browser-languagedetector`
- `i18next-http-backend`
- `react-i18next`

Internationalisation by `i18next` documentation: [Docs](https://www.i18next.com/)

## Detailed Steps
### 1. Install Packages
    npm run install

### 2. i18next Configuration
The i18next framework is configured in the file `frontend/i18n.js` of this app. Here you'll find the list of languages being used for translation at the moment and how they are configured.

To add a language, use it's shorthand form in the languages array:

    const languages = ['en', 'fr', '...']

In the configuration, i18n uses `LangugageDetector` to determine the user's language of choice if stored in localstorage otherwise it will default to English.

In the `i18n.init()` hook, you'll see the configuration of the language resources:

    resources:{
        en:{
            translation: _file path_
        },
        fr:{
            translation: _file path_
        },
    }

In this `resources` list is where you'll configure the `JSON` file paths to your translation files for each language in the languages array. The shorthand used in the languages array should be the same one used when configuring resources.

Now `i18n` knows how to internationalise the app.

### 3. Bundling the app with the i18next package
The configuration file is imported into the `index.js` file to be bundled upon the app starting.

    import './i18n.js'

In the `App.js` file, the `<I18nextProvider/>` tag is used as a wrapper for all the components described in the app routes.

### 4. Creating the translations
For each language described in `i18n.js`, there should be a corresponding translation file. The process of translation is quite manual and requires that every single word that is displayed in the app be compartmentalised in a JSON string. This means that each word displayed on the website is stored in a corresponding translation file as a JSON object.

The structure of these objects must be maintained across the different translation files for seamless translation. That means:

Structure in the `en` translation file

    {
        "products":{
            "monitor":{
                "title": 'Monitor',
                "subText":{
                    "navigationSubText": 'Built in Africa',
                    "pageSubText": 'Built in Africa for African Cities'
                }
            }
        }
    }

Should be matched in all other language files

    {
        "products":{
            "monitor":{
                "title": 'Moniteur',
                "subText":{
                    "navigationSubText": '__French translation__',
                    "pageSubText": '__French translation__'
                }
            }
        }
    }

The object names remain the same, but their string values change i.e. the translations.

**NOTE**: **The naming of the JSON objects should be as precise as possible to avoid confusion. As the translation file gets larger and larger, so will readability get more difficult if naming conventions are not maintained.**

### 5. Naming the JSON objects
It is crucial to be as precise as possible while naming the translation objects. Some words are used quite frequently within the website and could have their own category called _common_ but it seemed easier to categorise the translations according to components and pages rather than similarity.

If you know a word has already been translated then use _CTRL + F_ to find it in the file. But if this word comes in a different context then just create a separate `JSON` object for it and its sub-objects.

Use the structure:

    {
        "__PageName/ComponentName__":{
            "__ComponentName__":{
                "title":"_ComponentName_"
                ...
                "__SubComponent__":{
                    "title":"_Name_"
                    "desc":"_Description_"
                    ...
                    "__SubElement__":{
                        ...
                    }
                }
            }
            ...
        }
        ...
    }

### 6. Using i18n in React files
The `react-i18n` hook used for translation is 
    
    useTranslation()

To translate, use the `t` function from the `useTranslation()` hook.
The text in the file is replaced using it's JSON equivalent from the translation files.

From:

    <p>
        Built in Africa for African Cities
    </p>

To:

    <p>
    {t("homepage.products.monitor.subText.pageSubtext")}</p>

So when the language is toggled to another, the text is easily replaced by it's _selected-language_ equivalent.

Also: Use the `<Trans></Trans>` tag to translate text that includes `HTML` elements.

### 7. Translating Text
Currently the DeepL translator is being used for the language translations. But further due diligence should be done to make sure the translation context matches the meaning. This is made easy by the translator because it provides grammatical definitions as well.

Your grammar knowledge should be above average for successful translation. Proofreading can be a task passed on to another team.

Site link: [DeepL](https://www.deepl.com/en/translator)

### 8. Changing Languages
The language toggle is configured in the `TopBar.js` file. To add a new language to the toggle, update the languages variables in:

    const lngs = {
        en: {nativeName: 'English'},
        sp: {nativeName: 'Spanish'},
        ...
    }


## Conclusion
The translation process is quite manual as described but one can always find methods to make it easier especially in terms of readability and writability.

For more internationalisation information, make sure to visit the i18next [documentation](https://www.i18next.com/) site.
