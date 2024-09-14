export default class Bootloader extends Phaser.Scene {
  constructor() {
    super({ key: "bootloader" });
  }

  preload() {
    this.createBars();
    this.load.on(
      "progress",
      function (value) {
        this.progressBar.clear();
        this.progressBar.fillStyle(0xf09937, 1);
        this.progressBar.fillRect(
          this.cameras.main.width / 4,
          this.cameras.main.height / 2 - 16,
          (this.cameras.main.width / 2) * value,
          16
        );
      },
      this
    );

    this.load.on(
      "complete",
      () => {
        this.scene.start("splash");
        //this.scene.start("game", {name: "STAGE", number: 3});  // Use for testing levels
      },
      this
    );

    Array(5)
      .fill(0)
      .forEach((_, i) => {
        this.load.audio(`music${i}`, `assets/sounds/music/music${i}.mp3`);
      });

      this.load.image("bg1", "assets/images/bg1.png");
      this.load.image("bg2", "assets/images/bg2.png");
      this.load.image("bg3", "assets/images/bg3.png");
      this.load.image("blood", "assets/images/BloodSplash.png");
      this.load.image("chain", "assets/images/chain.png");
      this.load.image("dagger", "assets/images/dagger.png");
      this.load.image("attackButton", "assets/images/attackButton.png");
      this.load.image("moveButton", "assets/images/moveButton.png");
      this.load.image("jumpButton", "assets/images/jumpButton.png");
      
      this.load.audio("build", "assets/sounds/build.mp3");
      this.load.audio("slash", "assets/sounds/slash.mp3");
      this.load.audio("coin", "assets/sounds/coin.mp3");
      this.load.audio("death", "assets/sounds/death.mp3");
      this.load.audio("jump", "assets/sounds/jump.mp3");
      this.load.audio("kill", "assets/sounds/hit-impact-sword-3.mp3");
      this.load.audio("behead", "assets/sounds/beheading-with-sword.mp3");
      this.load.audio("land", "assets/sounds/land.mp3");
      this.load.audio("lunchbox", "assets/sounds/lunchbox.mp3");
      this.load.audio("prize", "assets/sounds/prize.mp3");
      this.load.audio("swordClash", "assets/sounds/sword-clash.mp3");
      this.load.audio("stone", "assets/sounds/stone.mp3");
      this.load.audio("stage", "assets/sounds/stage.mp3");
      this.load.audio("splash", "assets/sounds/music/Engine9Loop.mp3");
      this.load.audio("transition", "assets/sounds/music/ThisLoveLoop.mp3");
      this.load.audio("outroWin", "assets/sounds/music/JusticeForAllLoop.mp3");
      this.load.audio("outroLose", "assets/sounds/music/FadeToBlackLoop.mp3");


    Array(5)
      .fill(0)
      .forEach((_, i) => {
        this.load.image(
          `platform${i + 2}`,
          `assets/images/platform${i + 2}.png`
        );
      });

    this.load.tilemapTiledJSON("scene0", "assets/maps/scene0.tmj");
    this.load.tilemapTiledJSON("scene1", "assets/maps/scene1.tmj");
    this.load.tilemapTiledJSON("scene2", "assets/maps/scene2.tmj");
    this.load.tilemapTiledJSON("scene3", "assets/maps/scene3.tmj");
    
    this.load.image("oak_woods", "assets/maps/oak_woods_tileset.png");
    this.load.image("background", "assets/maps/background_tileset.png");

    this.load.bitmapFont(
      "pixelFont",
      "assets/fonts/mario.png",
      "assets/fonts/mario.xml"
    );
    this.load.bitmapFont(
      "hammerfont",
      "assets/fonts/hammer.png",
      "assets/fonts/hammer.xml"
    );
    this.load.bitmapFont(
      "arcadefont",
      "assets/fonts/arcade.png",
      "assets/fonts/arcade.xml"
    );

    this.load.spritesheet("player", "assets/images/DarkSamurai (128x128).png", {
      frameWidth: 128, frameHeight: 128
    });
    this.load.spritesheet("zombie", "assets/images/zombie_spritesheet.png", {
      frameWidth: 56,
      frameHeight: 56,
    });
    this.load.spritesheet("coin", "assets/images/coin.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("demon_door", "assets/images/demon_door.png", {
      frameWidth: 96,
      frameHeight: 96,
    });
    this.load.spritesheet("heart", "assets/images/heart_rotate2.png", {
      frameWidth: 20,
      frameHeight: 20,
    });
    this.load.spritesheet("bat", "assets/images/bat_40x40.png", {
      frameWidth: 40,
      frameHeight: 40,
    });
    this.load.spritesheet("chest", "assets/images/chest.png", {
      frameWidth: 96,
      frameHeight: 64,
    });
    this.load.spritesheet("fireworm", "assets/images/fireworm_64x90.png", {
      frameWidth: 90,
      frameHeight: 64,
    });
    this.load.spritesheet("fireball", "assets/images/fireball.png", {
      frameWidth: 46,
      frameHeight: 46,
    });
    

    if (this.sys.game.device.os.desktop)
      this.registry.set("desktop", 1);
    else
      this.registry.set("desktop", 0);

    this.registry.set("score", 0);
    this.registry.set("coins", 0);
    this.registry.set("hearts", 2);
  }

  createBars() {
    this.loadBar = this.add.graphics();
    this.loadBar.fillStyle(0xca6702, 1);
    this.loadBar.fillRect(
      this.cameras.main.width / 4 - 2,
      this.cameras.main.height / 2 - 18,
      this.cameras.main.width / 2 + 4,
      20
    );
    this.progressBar = this.add.graphics();
  }
}
