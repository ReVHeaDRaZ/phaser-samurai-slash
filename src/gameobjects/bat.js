import { sizes } from "../sizes";

export default class Bat extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type = "right") {
    super(scene, x, y, "bat");
    this.name = "bat";
    this.setScale(1);
    this.scene.physics.add.existing(this);
    this.scene.physics.world.enable(this);
    this.body.setAllowGravity(false);
    this.body.setSize(35, 30);
    this.body.immovable=true;
    this.scene.add.existing(this);
    this.direction = type === "right" ? 1 : -1;

    this.body.world.on('worldbounds', function(body) {
      // Checks if it's the sprite that you'listening for
      if (body.gameObject === this) {
        // Make the enemy sprite turn
        this.turn();
      }
    }, this);

    this.init();
  }
  /*
    Inits the animations for the bat and starts the movement. We also add a listener for the `animationcomplete` event.
    */
  init() {
    if(!this.scene.anims.exists(this.name)){
      this.scene.anims.create({
        key: this.name,
        frames: this.scene.anims.generateFrameNumbers(this.name, {
          start: 0,
          end: 4,
        }),
        frameRate: 10,
        repeat: -1,
      });

      this.scene.anims.create({
        key: this.name + "death",
        frames: this.scene.anims.generateFrameNumbers(this.name, {
          start: 5,
          end: 7,
        }),
        frameRate: 10,
      });
    }
    
    this.anims.play(this.name, true);
    this.body.setVelocityX(this.direction * 150);
    this.flipX = this.direction > 0;
    this.on("animationcomplete", this.animationComplete, this);
  }

  update() { }


  /*
    Turns the bat around and changes the direction
    */
  turn() {
    this.direction = -this.direction;
    this.flipX = this.direction > 0;
    this.body.setVelocityX(this.direction * 150);
  }

  /*
    This kills the bat by playing the death animation and particles.
    */
  death() {
    this.dead = true;
    this.body.enable = false;
    this.body.rotation = 0;
    this.anims.play(this.name + "death");
    this.scene.add.particles(this.x,this.y,'blood', {
      tint: 0xff0000,
      alpha: { start: .5, end: 0 },
      scale: {start:0.1, end: 0.4},
      speedY: {random: [-200,100]},
      speedX: {random: [-50, 50] },
      rotate: { min: -180, max: 180 },
      lifespan: { min: 400, max: 800 },
      frequency: 5,
      duration: 100,
      gravityY: 100,
    });    
  }

  /*
    This is called when any animation is completed. If the death animation is completed, then it destroys the bat.
    */
  animationComplete(animation, frame) {
    if (animation.key === this.name + "death") {
      this.destroy();
    }
  }
}
