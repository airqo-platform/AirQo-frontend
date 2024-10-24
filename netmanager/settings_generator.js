'use strict';
const SettingsGeneratorPlugin = (function () {
    const EVENT_NAME = 'afterEnvironment';
    const path = require('path');
    const fs = require('fs');

    function SettingsGeneratorPlugin(settingsData) {
        this.settingsData = settingsData;
    };

    SettingsGeneratorPlugin.prototype.apply = function (compiler) {
        if (compiler.hooks[EVENT_NAME]) {
            compiler.hooks[EVENT_NAME].tap('settings-generator-plugin', () => {
                fs.writeFile(
                    path.join(__dirname, "src", "settings.json"),
                    JSON.stringify(this.settingsData),
                    (error) => {
                        if (error) {
                            console.error(error);
                        } else {
                            console.log('settings.json generated correctly');
                        }
                    }
                );
            });
        }
    };

    return SettingsGeneratorPlugin;
})();

module.exports = SettingsGeneratorPlugin;
