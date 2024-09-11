export default class Dagger extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type = "right") {
    super(scene, x, y, "dagger");
    this.name = "dagger";
    this.scene = scene;
    this.setScale(1);
    this.scene.physics.add.existing(this);
    this.scene.physics.world.enable(this);
    this.body.setAllowGravity(false);
    this.body.setSize(28, 8);
    this.scene.add.existing(this);
    this.direction = type === "right" ? 1 : -1;
    this.setPipeline('Light2D');
    this.init();
  }

  init() {
    this.body.setVelocityX(this.direction * 400);
    this.flipX = this.direction < 0;
    //Destroy after 2secs
    this.scene.time.delayedCall(
      2000,
      () => {
        this.destroy();
      },
      null,
      this
    );
  }
    
  hit() {
    this.body.enable = false;    
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