export default class GlobalSettingPlugin extends Phaser.Plugins.BasePlugin {

    constructor(pluginManager) {
        super(pluginManager);

        this.settings = {
            musicVolume: 1 , 
            sfxVolume: 1
        };
    }

    setMusicVolume(v) {
        this.settings.musicVolume = v;
    }
    getMusicVolume() {
        return this.settings.musicVolume;
    }

    setSfxVolume(v) {
        this.settings.sfxVolume = v;
    }
    getSfxVolume() {
        return this.settings.sfxVolume;
    }
}
