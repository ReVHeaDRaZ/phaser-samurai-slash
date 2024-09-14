export default class ShadowMonster extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type = "right") {
    super(scene, x, y, "shadowmonster");
    this.name = "shadowmonster";
    this.scene = scene;
    this.setScale(1);
    this.scene.physics.add.existing(this);
    this.scene.physics.world.enable(this);
    this.body.setAllowGravity(true);
    this.setOffset(0,-5);
    this.scene.add.existing(this);
    this.direction = type === "right" ? -1 : 1;
    this.walkSpeed = 100;
    this.distanceBeforeAttack = 75;
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
        frames: this.scene.anims.generateFrameNumbers(this.name, { start: 0, end: 4, }),
        frameRate: 10,
        yoyo: true,
        repeat: -1,
      });
      this.scene.anims.create({
        key: this.name + "attack",
        frames: this.scene.anims.generateFrameNumbers(this.name, { start: 5, end: 13, }),
        frameRate: 25,
      });
      this.scene.anims.create({
        key: this.name + "attackLoop",
        frames: this.scene.anims.generateFrameNumbers(this.name, { start: 16, end: 19, }),
        frameRate: 15,
        repeat: 2
      });
      this.scene.anims.create({
        key: this.name + "attackEnd",
        frames: this.scene.anims.generateFrameNumbers(this.name, { start: 5, end: 13, }),
        frameRate: 35,
      });
      this.scene.anims.create({
        key: this.name + "hit",
        frames: this.scene.anims.generateFrameNumbers(this.name, { start: 16, end: 19, }),
        frameRate: 20,
      });
      this.scene.anims.create({
        key: this.name + "death",
        frames: this.scene.anims.generateFrameNumbers(this.name, { start: 16, end: 19, }),
        frameRate: 8,
      });
    }

    this.anims.play(this.name, true);
    this.body.setVelocityX(this.direction * this.walkSpeed);
    this.flipX = this.direction > 0;
    this.on("animationcomplete", this.animationComplete, this);
  }
 
  update(){
    if(!this.attacking && !this.dead && !this.recovering){
      if(this.distance >= this.distanceBeforeAttack){
        this.attack();
      }
      this.distance++;
    }
  }

  turn() {
    this.direction = -this.direction;
    this.flipX = this.direction > 0;
    this.body.setVelocityX(this.direction * this.walkSpeed);
  }

  attack(){
    this.attacking = true;
    this.body.setVelocityX(0);
    this.anims.play(this.name + "attack");
  }
   
  hit(hitDirection){
    // Can only be hit if attacking
    if(!this.recovering && !this.dead && this.attacking){
      this.anims.play(this.name + "hit");
      this.recovering = true;
      this.health--;
                  
      // Physics bump in the direction of hit
      if(hitDirection == "left")
        this.body.setVelocityX(100);
      
      if(hitDirection == "right")
        this.body.setVelocityX(-100);
  
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
            this.body.setVelocityX(this.direction * this.walkSpeed);
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
      this.distance = 0;
      this.anims.play(this.name + "attackLoop", true);
    }
    if (animation.key === this.name + "attackLoop") {
      this.anims.playReverse(this.name + "attackEnd", true);
      this.turn();
      this.attacking = false;
    }
    if (animation.key === this.name + "attackEnd") {
      this.anims.play(this.name,true);
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