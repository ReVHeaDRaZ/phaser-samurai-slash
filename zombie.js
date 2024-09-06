export default class Zombie extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type = "right") {
    super(scene, x, y, "zombie");
    this.name = "zombie";
    this.scene = scene;
    this.setScale(1.75);
    this.scene.physics.add.existing(this);
    this.scene.physics.world.enable(this);
    this.body.setAllowGravity(true);
    this.body.setSize(18, 30);
    this.scene.add.existing(this);
    this.direction = type === "right" ? -1 : 1;
    this.init();
  }

  init() {
    this.scene.anims.create({
      key: this.name,
      frames: this.scene.anims.generateFrameNumbers(this.name, { start: 9, end: 16, }),
      frameRate: 20,
      repeat: -1,
    });
    this.scene.anims.create({
      key: this.name + "death",
      frames: this.scene.anims.generateFrameNumbers(this.name, { start: 27, end: 35, }),
      frameRate: 8,
    });
    this.anims.play(this.name, true);
    this.body.setVelocityX(this.direction * 70);
    this.flipX = this.direction < 0;
    this.on("animationcomplete", this.animationComplete, this);
  }
 
  turn() {
    this.direction = -this.direction;
    this.flipX = this.direction < 0;
    this.body.setVelocityX(this.direction * 70);
  }
   
  death() {
    this.dead = true;
    this.body.enable = false;
    this.body.rotation = 0;
    this.anims.play(this.name + "death");
    this.scene.add.particles(this.x,this.y,'blood', {
      tint: 0xff0000,
      alpha: { start: .5, end: 0 },
      scale: {start:0.01, end: 0.5},
      speedY: {random: [-200,-350]},
      speedX: {random: [-50, 50] },
      rotate: { min: -180, max: 180 },
      lifespan: { min: 500, max: 1000 },
      frequency: 10,
      duration: 1000,
      gravityY: 700
    });    
  }
    
  animationComplete(animation, frame) {
    if (animation.key === this.name + "death") {
      this.scene.tweens.add({
        targets: this,
        duration: 300,
        alpha: { from: 1, to: 0 },
        onComplete: () => {
          this.destroy();
        },
      });
    }
  }
}