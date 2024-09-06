export default class Outro extends Phaser.Scene {
  constructor() {
    super({ key: "outro" });
  }

  init(data) {
    this.isDead = data.isDead;
  }
  create() {
    this.width = this.sys.game.config.width;
    this.height = this.sys.game.config.height;
    this.center_width = this.width / 2;
    this.center_height = this.height / 2;
    this.introLayer = this.add.layer();
    this.splashLayer = this.add.layer();
    this.text = [
      "You did it!!",
      "Thanks to your Samurai skills",
      "and your mighty sword,",
      "you have saved the earth.",
      "",
      "Total Coins",
      "",
      "Press SPACE",
    ];

    if(this.isDead){
      this.text = [
        "You have failed!!",
        "Unfortunately your Samurai skills",
        "are not up to the task of saving",
        "the earth from evil monsters.",
        "",
        "Total Coins",
        "",
        "Press SPACE",
      ];
    }

    
    this.showHistory();
    
    this.input.keyboard.on("keydown-SPACE", this.startSplash, this);
    this.input.keyboard.on("keydown-ENTER", this.startSplash, this);
  }

  startSplash() {
    this.scene.start("splash");
  }

  /*
    Helper function to show the text line by line
    */
  showHistory() {
    this.text.forEach((line, i) => {
      this.time.delayedCall(
        (i) * 1000,
        () => {
          this.showLine(line, (i + 1) * 50);
          if(i==6)
            this.showScore();
        },
        null,
        this
      );
    });
  }

  showLine(text, y) {
    let line = this.introLayer.add(
      this.add
        .bitmapText(this.center_width, y, "pixelFont", text, 15)
        .setOrigin(0.5)
        .setAlpha(0)
    );
    this.tweens.add({
      targets: line,
      duration: 2000,
      alpha: 1,
    });
  }

  /*
    Helper function to show the total score then reset hearts an coins
    */
    showScore() {
      this.scoreCoins = this.add
        .bitmapText(
          this.center_width + 32,
          this.center_height + 95,
          "pixelFont",
          "x" + this.registry.get("coins"),
          30
        )
        .setDropShadow(0, 4, 0x222222, 0.9)
        .setOrigin(0.5)
        .setScrollFactor(0);
      this.scoreCoinsLogo = this.add
        .sprite(this.center_width - 32, this.center_height + 95, "coin")
        .setScale(0.7)
        .setOrigin(0.5)
        .setScrollFactor(0);
      const coinAnimation = this.anims.create({
        key: "coinscore",
        frames: this.anims.generateFrameNumbers("coin", { start: 0, end: 7 }),
        frameRate: 8,
      });
      this.scoreCoinsLogo.play({ key: "coinscore", repeat: -1 });

      // Reset score and hearts
    this.registry.set("hearts", 2);
    this.registry.set("coins", 0);
    }
}
