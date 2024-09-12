export default class Fireball extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type = "right") {
    super(scene, x, y, "fireball");
    this.name = "fireball";
    this.scene = scene;
    this.setScale(1.5);
    this.scene.physics.add.existing(this);
    this.scene.physics.world.enable(this);
    this.body.setAllowGravity(false);
    this.body.setSize(16, 16);
    this.scene.add.existing(this);
    this.direction = type === "right" ? 1 : -1;
    //this.setPipeline('Light2D');
    this.init();
  }

  init() {
    if(!this.scene.anims.exists(this.name)){
      this.scene.anims.create({
        key: this.name,
        frames: this.scene.anims.generateFrameNumbers(this.name, { start: 0, end: 5, }),
        frameRate: 20,
        repeat: -1,
      });
      this.scene.anims.create({
        key: this.name + "explode",
        frames: this.scene.anims.generateFrameNumbers(this.name, { start: 7, end: 13, }),
        frameRate: 20,
      });
    }

    this.anims.play(this.name, true);
    this.on("animationcomplete", this.animationComplete, this);

    this.body.setVelocityX(this.direction * 300);
    this.flipX = this.direction < 0;
    //Destroy after 2secs
    this.scene.time.delayedCall(
      2000,
      () => {
        this.scene.tweens.add({
          targets: this,
          duration: 200,
          alpha: { from: 1, to: 0 },
          onComplete: () => {
            this.destroy();
          },
        });
      },
      null,
      this
    );
  }
    
  hit() {
    this.body.enable = false;   
    this.anims.play(this.name + "explode",true); 
  }

  turn(){
    this.hit();
  }

  animationComplete(animation, frame) {
    if (animation.key === "explode") {
      this.scene.tweens.add({
        targets: this,
        duration: 200,
        alpha: { from: 1, to: 0 },
        onComplete: () => {
          this.destroy();
        },
      });
    }
   
  }
}