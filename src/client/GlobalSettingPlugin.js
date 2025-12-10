export default class GlobalSettingPlugin extends Phaser.Plugins.BasePlugin {

    constructor(pluginManager) {
        super(pluginManager);

        // Valores globales de volumen
        this.settings = {
            musicVolume: 1,
            sfxVolume: 1
        };
    }

    // Se guarda el volumen de música
    setMusicVolume(v) {
        this.settings.musicVolume = v;
    }

    //Se obtiene el volumen de música
    getMusicVolume() {
        return this.settings.musicVolume;
    }

    //  Se guarda el volumen de efectos
    setSfxVolume(v) {
        this.settings.sfxVolume = v;
    }

    //Se obtiene el volumen de efectos
    getSfxVolume() {
        return this.settings.sfxVolume;
    }
}

