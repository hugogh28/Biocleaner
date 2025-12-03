export default class BrightnessPlugin extends Phaser.Plugins.BasePlugin { 
    constructor(pluginManager) {
        super(pluginManager);
        this.brightness = 1; // brillo inicial
    }

    // Se guarda el brillo
    setBrightness(value) {
        this.brightness = value;
    }

    // Se obtiene el brillo
    getBrightness() {
        return this.brightness;
    }

    // Se crea la capa que controla el brillo
    applyToScene(scene) {
        const overlay = scene.add.rectangle(400, 300, 800, 600, 0xffffff);
        overlay.setDepth(9999);              // se coloca encima de todo
        scene.brightnessOverlay = overlay;   // se asigna al scene

        this.updateOverlay(scene);           // se aplica el brillo actual
    }

    // Se ajusta la capa en función del brillo
    updateOverlay(scene) {
        const br = this.brightness;

        if (br < 1) {
            // se oscurece la pantalla
            scene.brightnessOverlay.setFillStyle(0x000000);
            scene.brightnessOverlay.setBlendMode(Phaser.BlendModes.MULTIPLY);
            scene.brightnessOverlay.alpha = 1 - br;
        } else {
            // se aclara la pantalla
            scene.brightnessOverlay.setFillStyle(0xffffff);
            scene.brightnessOverlay.setBlendMode(Phaser.BlendModes.ADD);
            scene.brightnessOverlay.alpha = br - 1;
        }
    }
}
