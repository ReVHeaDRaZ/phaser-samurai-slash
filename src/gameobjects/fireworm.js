import Fireball from "./fireball";

export default class Fireworm extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type = "right") {
    super(scene, x, y, "fireworm");
    this.name = "fireworm";
    this.scene = scene;
    this.setScale(1);
    this.scene.physics.add.existing(this);
    this.scene.physics.world.enable(this);
    this.body.setAllowGravity(true);
    this.body.setSize(56, 32);
    this.setOffset(20,30);
    this.scene.add.existing(this);
    this.direction = type === "right" ? -1 : 1;
    this.distanceBeforeAttack = 100;
    this.distance = 0;
    this.attacking = false;
    this.health = 2;
    this.recovering = false;

    this.setPipeline('Light2D');
    this.init();
  }

  init() {
    if(!this.scene.anims.exists(this.name)){
      this.scene.anims.create({
        key: this.name,
        frames: this.scene.anims.generateFrameNumbers(this.name, { start: 9, end: 17, }),
        frameRate: 15,
        repeat: -1,
      });
      this.scene.anims.create({
        key: this.name + "attack",
        frames: this.scene.anims.generateFrameNumbers(this.name, { start: 36, end: 47, }),
        frameRate: 15,
      });
      this.scene.anims.create({
        key: this.name + "attackEnd",
        frames: this.scene.anims.generateFrameNumbers(this.name, { start: 48, end: 51, }),
        frameRate: 15,
      });
      this.scene.anims.create({
        key: this.name + "hit",
        frames: this.scene.anims.generateFrameNumbers(this.name, { start: 27, end: 29, }),
        frameRate: 20,
      });
      this.scene.anims.create({
        key: this.name + "death",
        frames: this.scene.anims.generateFrameNumbers(this.name, { start: 18, end: 25, }),
        frameRate: 8,
      });
    }

    this.anims.play(this.name, true);
    this.body.setVelocityX(this.direction * 70);
    this.flipX = this.direction < 0;
    this.on("animationcomplete", this.animationComplete, this);
  }
 
  update(){
    if(!this.attacking && !this.dead && !this.recovering){
      if(this.distance >= this.distanceBeforeAttack){
        this.distance = 0;
        this.attack();
      }
      this.distance++;
    }
  }

  turn() {
    this.direction = -this.direction;
    this.flipX = this.direction < 0;
    this.body.setVelocityX(this.direction * 70);
  }

  attack(){
    this.attacking = true;
    this.body.setVelocityX(0);
    this.anims.play(this.name + "attack");
  }
   
  hit(){
    if(!this.recovering && !this.dead){
      this.anims.play(this.name + "hit");
      this.recovering = true;
      this.health--;
      console.log("HIT");
      //Blood Spatter
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
      //Pulse alpha while recovering, then on complete set recovering to false and continue walking;
      this.scene.tweens.add({
        targets: this,
        duration: 200,
        alpha: { from: 1, to: 0.75 },
        repeat: 1,
        onComplete: () => {
          if(!this.dead){
            this.recovering=false;
            this.attacking=false;
            this.setAlpha(1);
            this.anims.play(this.name);
            this.body.setVelocityX(this.direction * 70);
          }
        }
      });
    }

    if(this.health <= 0){
      this.death();
    }
  }

  death() {
    this.dead = true;
    this.body.enable = false;
    this.body.rotation = 0;
    this.anims.play(this.name + "death", true);
    //Blood Squirting
    this.scene.add.particles(this.x,this.y,'blood', {
      tint: 0xff0000,
      alpha: { start: .5, end: 0 },
      scale: {start:0.01, end: 0.4},
      speedY: {random: [-200,-350]},
      speedX: {random: [-50, 50] },
      rotate: { min: -180, max: 180 },
      lifespan: { min: 500, max: 1000 },
      frequency: 10,
      duration: 1000,
      gravityY: 700,
      bounds: {x:this.x-50, y:this.y-50, width: 100, height: 64},
      collideBotton: true
    });    
  }
    
  animationComplete(animation, frame) {
    if (animation.key === this.name + "attack") {
      //Spawn Fireball
      const offsetX = this.direction > 0 ? 40 : -40;
      this.fireball = new Fireball(this.scene, this.x + offsetX, this.y+7, this.direction > 0 ? "right":"left");
      this.scene.fireballs.add(this.fireball);

      this.anims.play(this.name + "attackEnd", true);
    }
    if (animation.key === this.name + "attackEnd") {
      this.anims.play(this.name), true;
      this.turn();
      this.attacking = false;
    }
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