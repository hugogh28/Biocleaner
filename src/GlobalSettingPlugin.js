export default class GlobalSettingPlugin extends Phaser.Plugins.BasePlugin {

    constructor(pluginManager) {
        super(pluginManager);

        this.settings = {
            brightness: 1,   
            musicVolume: 1  
        };
    }

    setMusicVolume(v) {
        this.settings.musicVolume = v;
    }
    getMusicVolume() {
        return this.settings.musicVolume;
    }
}
