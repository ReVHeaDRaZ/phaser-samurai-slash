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
    this.on("animationcomplete", this.animationComplete, this);
  }

  /*
    This is called when the player hits the chest. It plays the openeing animation which calls the `showPrize` method.
    */
  hit() {
    this.disabled = true;
    this.anims.play(this.name + "opening", true);
    this.scene.time.delayedCall(
      1000,
      () => {
        this.destroy();
        if(this.prizeSprite) this.prizeSprite.destroy();
      },
      null,
      this
    );
  }

  /*
    This method picks a random prize and it shows it to the player when opening the chest. It plays a tween animation and calls the `applyPrize` method from the player.
    */
  showPrize() {
    const prize = ["dagger", "coin", "heart"];
    const selectedPrize = Phaser.Math.RND.pick(prize);
    this.scene.player.applyPrize(selectedPrize);
    let scale = selectedPrize=="coin" ? 0.35 : selectedPrize=="heart" ? 1 : 1
    
    if(selectedPrize=="coin"){
      this.scene.add.particles(this.x-60,this.y-10,'coin', {
        alpha: { start: 1, end: 0 },
        scale: {start:0.05, end: 0.25},
        speedY: {random: [-200,-350]},
        speedX: {random: [-50, 50] },
        rotate: { min: -180, max: 180 },
        lifespan: { min: 500, max: 1000 },
        frequency: 10,
        duration: 200,
        gravityY: 700,
        bounds: {x:this.x-150, y:this.y-50, width: 100, height: 64},
        collideBotton: true
      });
    }else{
      this.prizeSprite = this.scene.add
        .sprite(this.x-60, this.y-40, selectedPrize)
        .setOrigin(0)
        .setScale(scale);
      this.scene.tweens.add({
        targets: this.prizeSprite,
        duration: 500,
        y: { from: this.y-40, to: this.y - 70 },
        scale: {from: this.prizeSprite.scale, to: this.prizeSprite.scale *1.5}
      });
    }
  }

  // Used to call the showPrize method after animation completes
  animationComplete(animation, frame) {
    if (animation.key === this.name+"opening") {
      this.showPrize();
      this.scene.playAudio("prize");
    }
  }
}

export default Chest;
