import { Debris } from "../gameobjects/particle";

export default class Splash extends Phaser.Scene {
  constructor() {
    super({ key: "splash" });
  }

  create() {
    this.width = this.sys.game.config.width;
    this.height = this.sys.game.config.height;
    this.center_width = this.width / 2;
    this.center_height = this.height / 2;

    this.cameras.main.setBackgroundColor(0x000000);
    this.time.delayedCall(1000, () => this.showInstructions(), null, this);

    this.input.keyboard.on("keydown-SPACE", () => this.startGame(), this);
    this.input.keyboard.on("keydown-ENTER", () => this.startGame(), this);
    this.input.on('pointerdown', () => this.startGame(), this);
    this.showTitle();
    this.playMusic();
  }

  startGame() {
    if (this.theme) this.theme.stop();
    this.scene.start("transition", {
      next: "game",
      name: "STAGE",
      number: 0,
      time: 30,
    });
  }

  /*
    Helper function to show the title letter by letter
    */
  showTitle() {
    this.playAudioRandomly("slash");
    
    let lineOne = "SAMURAI".split("");
    lineOne.forEach((letter, i) => {
      if(i==1){
        this.slashMark = this.add.ellipse(30,70,450,10,0xffffff).setOrigin(0).setDepth(1);
        this.tweens.add({
          targets: this.slashMark,
          duration: 300,
          alpha: { from: 1, to: 0 },
          scale: { from: 0, to: 1 },
          repeat: 0,
          onComplete: ()=>{this.slashMark.destroy()}
        })
      }

      if(i==2)
        this.playAudioRandomly("swordClash");
      if(i==lineOne.length-1)
        this.playAudioRandomly("stone");

      this.time.delayedCall(
        50 * (i + 1),
        () => {
          //if (Phaser.Math.Between(0, 5) > 2) this.playAudioRandomly("stone");
          let text = this.add
            .bitmapText(70 * (i + 1) - 30, 70, "hammerfont", letter, 60)
            .setTint(0xca6702)
            .setOrigin(0.5)
            .setDropShadow(3, 5, 0xf09937, 0.9);
          Array(Phaser.Math.Between(4, 6))
            .fill(0)
            .forEach((i) => new Debris(this, text.x, text.y, 0xca6702));
        },
        null,
        this
      );
    });

    let lineTwo = "SLASHER".split("");
    lineTwo.forEach((letter, i) => {
      this.time.delayedCall(
        50 * (i + 1) + 800,
        () => {
          if(i==1){
            this.playAudioRandomly("slash");
            this.slashMark = this.add.ellipse(30,170,450,10,0xffffff).setOrigin(0).setDepth(1);
            this.tweens.add({
              targets: this.slashMark,
              duration: 300,
              alpha: { from: 1, to: 0 },
              scale: { from: 0, to: 1 },
              repeat: 0,
              onComplete: ()=>{this.slashMark.destroy()}
            })
          }
          
          if(i==2)
            this.playAudioRandomly("swordClash");
          if(i==lineTwo.length-1)
            this.playAudioRandomly("stone");
          
          let text = this.add
            .bitmapText(70 * (i + 1) - 30, 170, "hammerfont", letter, 60)
            .setTint(0xca6702)
            .setOrigin(0.5)
            .setDropShadow(3, 5, 0xf09937, 0.9);
          Array(Phaser.Math.Between(4, 6))
            .fill(0)
            .forEach((i) => new Debris(this, text.x, text.y, 0xca6702));
        },
        null,
        this
      );
    });

  }

  /*
    Helper function to play audio randomly to add variety.
    */
  playAudioRandomly(key) {
    const volume = Phaser.Math.Between(0.9, 1);
    const rate = Phaser.Math.Between(0.9, 1);
    this.sound.add(key).play({ volume, rate });
  }

  playMusic(theme = "splash") {
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

  /*
    Generates the instructions text for the player.
    */
  showInstructions() {
    if(this.registry.get("desktop")){
      this.add
        .bitmapText(this.center_width, 300, "pixelFont", "WASD/Arrows: move", 20)
        .setOrigin(0.5);
      this.add
        .bitmapText(this.center_width, 350, "pixelFont", "SPACE: ATTACK", 20)
        .setOrigin(0.5);
      this.add
        .bitmapText(this.center_width, 480, "pixelFont", "By RaZ", 15)
        .setOrigin(0.5);
      this.space = this.add
        .bitmapText(
          this.center_width,
          530,
          "pixelFont",
          "Press SPACE to start",
          20
        )
        .setOrigin(0.5);
    }else{
      this.add
        .bitmapText(this.center_width, 480, "pixelFont", "By RaZ", 15)
        .setOrigin(0.5);
      this.space = this.add
        .bitmapText(
          this.center_width,
          530,
          "pixelFont",
          "Touch to start",
          20
        )
        .setOrigin(0.5);
    }


    this.tweens.add({
      targets: this.space,
      duration: 300,
      alpha: { from: 0, to: 1 },
      repeat: -1,
      yoyo: true,
    });
  }
}
