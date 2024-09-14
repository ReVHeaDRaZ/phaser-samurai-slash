import { sizes } from "../sizes";
export default class Transition extends Phaser.Scene {
  constructor() {
    super({ key: "transition" });
  }

  init(data) {
    this.name = data.name;
    this.number = data.number;
    this.next = data.next;
  }

  /*
    This creates the elements of the transition screen.
    */
  create() {
    const messages = ["TUTORIAL", "STAGE 1", "STAGE 2", "STAGE 3", "STAGE 4"];
    this.width = this.sys.game.config.width;
    this.height = this.sys.game.config.height;
    this.center_width = this.width / 2;
    this.center_height = this.height / 2;
    this.cameras.main.setBackgroundColor(0x181818); //(0x00b140)//(0x62a2bf)
    this.add.tileSprite(0, 0, sizes.width, sizes.height+sizes.controlsHeight, "bg1").setOrigin(0).setScale(4).setScrollFactor(0,0).setTint(0x333333);

    if (this.registry.get("hearts") <= 0)
      this.loadOutro(true);
    else if (this.number === 4)
      this.loadOutro();
    else{
      this.addScore();

      this.add.sprite(this.center_width, this.center_height - 170, "player").setScale(2);
      this.add
        .bitmapText(
          this.center_width,
          this.center_height - 10,
          "pixelFont",
          messages[this.number],
          30
        )
        .setOrigin(0.5);
      this.add
        .bitmapText(
          this.center_width,
          this.center_height + 30,
          "pixelFont",
          "Ready?",
          20
        )
        .setOrigin(0.5);
      this.input.keyboard.on("keydown-ENTER", () => this.loadNext(), this);
      this.input.keyboard.on("keydown-SPACE", () => this.loadNext(), this);
      this.input.on('pointerdown', () => this.loadNext(), this);
      this.time.delayedCall(
        3000,
        () => {
          this.loadNext();
        },
        null,
        this
      );

      this.playMusic();
    }
  }

  /*
    These functions are used to load the next scene
    */
  loadNext() {
    if (this.theme) this.theme.stop();
    this.scene.start("game", { name: this.name, number: this.number });
  }

  loadOutro(isDead = false) {
    if (this.theme) this.theme.stop();
    this.scene.start("outro", { name: this.name, number: this.number, isDead: isDead });
  }

  /*
    Helper function to show the score and hearts
    */
  addScore() {
    this.scoreCoins = this.add
      .bitmapText(
        this.center_width + 32,
        this.center_height - 75,
        "pixelFont",
        "x" + this.registry.get("coins"),
        30
      )
      .setDropShadow(0, 4, 0x222222, 0.9)
      .setOrigin(0.5)
      .setScrollFactor(0);
    this.scoreCoinsLogo = this.add
      .sprite(this.center_width - 32, this.center_height - 75, "coin")
      .setScale(1.25)
      .setOrigin(0.5)
      .setScrollFactor(0);
    if(!this.anims.exists("coinscore")){
      this.anims.create({
        key: "coinscore",
        frames: this.anims.generateFrameNumbers("coin", { start: 0, end: 7 }),
        frameRate: 8,
      });
    }
    this.scoreCoinsLogo.play({ key: "coinscore", repeat: -1 });

    this.scoreHearts = this.add
      .bitmapText(this.center_width+70, 70, "pixelFont", "x" + this.registry.get("hearts"), 20)
      .setDropShadow(0, 4, 0x222222, 0.9)
      .setOrigin(0)
      .setScrollFactor(0);
    this.scoreHeartsLogo = this.add
      .sprite(this.center_width+50, 80, "heart")
      .setScale(1.7)
      .setOrigin(0.5)
      .setScrollFactor(0);
    if(!this.anims.exists("heartscore")){
      this.anims.create({
        key: "heartscore",
        frames: this.anims.generateFrameNumbers("heart", { start: 0, end: 6 }),
        frameRate: 8,
      });
      this.anims.create({
        key: "hurtheartscore",
        frames: this.anims.generateFrameNumbers("heart", { start: 9, end: 15 }),
        frameRate: 8,
      });
    }
    this.scoreHeartsLogo.play({ key: "heartscore", repeat: -1 });
  }

  playMusic(theme = "transition") {
    this.theme = this.sound.add(theme);
    this.theme.stop();
    this.theme.play({
      mute: false,
      volume: 1,
      rate: 1,
      detune: 0,
      seek: 0,
      loop: true,
      delay: 0,
    });
  }
}
