class Chest extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, name = "chest") {
    super(scene, x, y, name);
    this.scene = scene;
    this.name = name;
    this.setScale(1.75);
    this.setOrigin(1);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.immovable = true;
    this.body.moves = false;
    this.disabled = false;
    this.init();
  }

  /*
    Inits the animations
    */
  init() {
    this.scene.anims.create({
      key: this.name,
      frames: this.scene.anims.generateFrameNumbers(this.name, {
        start: 0,
        end: 0,
      }),
      frameRate: 1,
    });

    this.scene.anims.create({
      key: this.name + "opening",
      frames: this.scene.anims.generateFrameNumbers(this.name, {
        start: 0,
        end: 9,
      }),
      frameRate: 20,
    });

    this.scene.anims.create({
      key: this.name + "opened",
      frames: this.scene.anims.generateFrameNumbers(this.name, {
        start: 9,
        end: 9,
      }),
      frameRate: 1,
    });

    this.anims.play(this.name, true);
  }

  /*
    This is called when the player picks the lunchbox. It plays the opened animation and calls the `showPrize` method.
    */
  pick() {
    this.anims.play(this.name + "opening", true);
    this.showPrize();
    this.disabled = true;
    this.scene.time.delayedCall(
      1000,
      () => {
        this.destroy();
        //this.prizeSprite.destroy();
      },
      null,
      this
    );
  }

  /*
    This method picks a random prize and it shows it to the player when picking the lunchbox. It plays a tween animation and calls the `applyPrize` method from the player.
    */
  showPrize() {
    const prize = ["boots", "hammer", "coin", "star", "speed"];
    const selectedPrize = Phaser.Math.RND.pick(prize);
    console.log(selectedPrize);
    // this.scene.player.applyPrize(selectedPrize);
    // this.prizeSprite = this.scene.add
    //   .sprite(this.x, this.y, selectedPrize)
    //   .setOrigin(0.5)
    //   .setScale(0.8);
    // this.scene.tweens.add({
    //   targets: this.prizeSprite,
    //   duration: 500,
    //   y: { from: this.y, to: this.y - 64 },
    //   onComplete: () => {
    //     this.scene.playAudio("prize");
    //   },
    // });
  }
}

export default Chest;
