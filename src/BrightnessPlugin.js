export default class BrightnessPlugin extends Phaser.Plugins.BasePlugin {
    constructor(pluginManager) {
        super(pluginManager);
        this.brightness = 1; // valor por defecto
    }

    setBrightness(value) {
        this.brightness = value;
    }

    getBrightness() {
        return this.brightness;
    }

    applyToScene(scene) {
        // Capa
        const overlay = scene.add.rectangle(
            400, 300, 800, 600, 0xffffff
        );
        overlay.setDepth(9999);

        scene.brightnessOverlay = overlay;

        this.updateOverlay(scene);
    }

    updateOverlay(scene) {
        const br = this.brightness;

        if (br < 1) {
            // oscurecer
            scene.brightnessOverlay.setFillStyle(0x000000);
            scene.brightnessOverlay.setBlendMode(Phaser.BlendModes.MULTIPLY);
            scene.brightnessOverlay.alpha = 1 - br;
        } else {
            // aclarar
            scene.brightnessOverlay.setFillStyle(0xffffff);
            scene.brightnessOverlay.setBlendMode(Phaser.BlendModes.ADD);
            scene.brightnessOverlay.alpha = br - 1;
        }
    }
}