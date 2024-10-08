import Phaser from 'phaser'
import Blow from './blow';
import Dagger from './dagger';
import { JumpSmoke } from "./particle";
import { sizes } from '../sizes';
import Coin from './coin';

class Player extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, health = 2, daggers = 0, attackLevel = 0) {
    super(scene, x, y, "player");
    this.setOrigin(0.5);
    this.setScale(1);
    this.setDepth(2); //Set depth of 2 so attackFX can be in front or behind
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    
    // Keyboard Controls
    this.cursor = this.scene.input.keyboard.createCursorKeys();
    this.spaceBar = this.scene.input.keyboard.addKey( Phaser.Input.Keyboard.KeyCodes.SPACE );
    this.W = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.A = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.S = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.D = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // Virtual Joystick and buttons for mobile
    this.scene.add.rectangle(0, sizes.height, sizes.width, sizes.controlsHeight, 0x181818).setOrigin(0).setScrollFactor(0).setDepth(4);
    this.joystick = this.scene.plugins.get('rexVirtualJoystick').add(this.scene, {
      x: sizes.controlsOffset,
      y: sizes.height + sizes.controlsHeight - sizes.controlsOffset,
      radius: 100,
      base: this.scene.add.image(0,0, 'moveButton').setDisplaySize(108, 108).setAlpha(0.01).setDepth(5),
      thumb: this.scene.add.image(0, 0, 'moveButton').setDisplaySize(64, 64).setAlpha(0.25).setDepth(5),
      dir: 'left&right',
      // forceMin: 16,
      // fixed: true,
      // enable: true
    });
    this.attackButton = scene.plugins.get('rexButton')
      .add(this.scene.add.sprite(sizes.width-sizes.controlsOffset*0.75, sizes.height + sizes.controlsHeight - sizes.controlsOffset,"attackButton")
      .setAlpha(0.25).setScrollFactor(0).setDepth(5), {
        // enable: true,
        mode: 0,              // 0|'press'|1|'release'
        // clickInterval: 100    // ms
    });
    this.jumpButton = scene.plugins.get('rexButton')
      .add(this.scene.add.sprite(sizes.width-sizes.controlsOffset*2, sizes.height + sizes.controlsHeight - sizes.controlsOffset,"jumpButton")
      .setAlpha(0.25).setScrollFactor(0).setDepth(5), {
        // enable: true,
        mode: 0,              // 0|'press'|1|'release'
        // clickInterval: 100    // ms
    });
    this.jumpButtonPressed = false;
    this.scene.input.addPointer(1);
    this.joystickCursor = this.joystick.createCursorKeys();
    this.attackButton.on('down', () => this.attack());
    this.jumpButton.on('down', () => {
      if(!this.jumping && !this.falling)
        this.jumpButtonPressed=true
    });
    this.jumpButton.on('up', () => this.jumpButtonPressed=false);


    this.right = true;
    this.body.setSize(40, 60);
    this.body.setBounce(0.001);
    this.body.setCollideWorldBounds(true);
    this.init();

    this.jumping = false;
    this.falling = false;
    this.attacking = false;
    this.timeBetweenAttacks = 300;
    this.attackLevel = attackLevel;
    this.attackFX = this.scene.add.sprite(this.x,this.y,"fireslash").setDepth(3).setVisible(false);
    this.bleedingFX = this.scene.add.particles(this.x,this.y,'blood', {
      tint: 0xff0000,
      alpha: { start: .5, end: 0 },
      scale: {start:0.01, end: 0.4},
      speedY: {random: [-100,-200]},
      speedX: {random: [-50, 50] },
      rotate: { min: -180, max: 180 },
      lifespan: { min: 400, max: 800 },
      frequency: 100,
      duration: 0,
      gravityY: 700,
      emitting: false
    });    
    this.walkVelocity = 200;
    this.jumpVelocity = -400;
    this.invincible = false;
    this.health = health;
    this.hurt = false;
    this.hurtTween = null;
    this.dead = false;
    this.combo = 0;
    this.daggers = daggers;

    this.setPipeline('Light2D');
  }

  init() {
    //Animations
    if(!this.scene.anims.exists("idle")){
      this.scene.anims.create({
        key: "idle",
        frames: this.scene.anims.generateFrameNumbers('player', {start:0, end:7}),
        frameRate: 10,
        repeat: -1,
      });
      this.scene.anims.create({
        key: "run",
        frames: this.scene.anims.generateFrameNumbers("player", {start:14, end:21}),
        frameRate: 10,
        repeat: -1
      });
      this.scene.anims.create({
        key: "attack1",
        frames: this.scene.anims.generateFrameNumbers("player", {start:28, end:31}),
        frameRate: 10,
        repeat: 0
      });
      this.scene.anims.create({
        key: "attack2",
        frames: this.scene.anims.generateFrameNumbers("player", {start:42, end:44}),
        frameRate: 10,
        repeat: 0
      });
      this.scene.anims.create({
        key: "jumpUp",
        frames: this.scene.anims.generateFrameNumbers("player", {start:56, end:59}),
        frameRate: 10,
        repeat: -1
      });
      this.scene.anims.create({
        key: "jumpDown",
        frames: this.scene.anims.generateFrameNumbers("player", {start:70, end:73}),
        frameRate: 10,
        repeat: -1
      });
      this.scene.anims.create({
        key: "hurt",
        frames: this.scene.anims.generateFrameNumbers("player", {start:84, end:85}),
        frameRate: 10,
        repeat: -1
      });
      this.scene.anims.create({
        key: "die",
        frames: this.scene.anims.generateFrameNumbers("player", {start:98, end:111}),
        frameRate: 25,
        repeat: 0
      });
      this.scene.anims.create({
        key: "fireattack1",
        frames: this.scene.anims.generateFrameNumbers("fireslash", {start:0, end:3}),
        frameRate: 10,
        repeat: 0
      });
      this.scene.anims.create({
        key: "fireattack2",
        frames: this.scene.anims.generateFrameNumbers("fireslash", {start:4, end:7}),
        frameRate: 10,
        repeat: 0
      });
    }

    this.anims.play("idle", true);
    this.on("animationcomplete", this.animationComplete, this);

    // Add a light to follow player on update
    this.light = this.scene.lights.addLight(this.x, this.y, 350,0xffffff,0.35);
  }

  update() {
    // Constrain light and FX to player
    this.light.x = this.x;
    this.light.y = this.y;
    this.attackFX.x = this.x+(this.right ? 20 : -20);
    this.attackFX.y = this.y+5;
    this.bleedingFX.x = this.x;
    this.bleedingFX.y = this.y;
    
    if (this.dead) return;
    
    if (this.body.velocity.y > 150) {
      this.falling = true;
      if (!this.attacking ) this.anims.play("jumpDown", true);
    }
    if (this.body.blocked.down) {
      if (this.jumping || this.falling) {
        this.jumping = false;
        this.falling = false;
        this.scene.playAudio("land");
        this.landSmoke();
      }
    }

    if (this.body.blocked.down) {
      this.jumping = false;
      this.falling = false;
    }

    if ( (Phaser.Input.Keyboard.JustDown(this.cursor.up) || Phaser.Input.Keyboard.JustDown(this.W) || this.jumpButtonPressed) && !this.falling && !this.jumping) {
      this.jumpButtonPressed=false;
      this.body.setVelocityY(this.jumpVelocity);
      if (!this.attacking ) this.anims.play("jumpUp", true);
      this.scene.playAudio("jump");
      this.jumping = true;
      this.jumpSmoke();
    }else if (this.cursor.right.isDown || this.D.isDown || this.joystickCursor.right.isDown) {
      if (this.body.blocked.down) {
        if (!this.attacking ) this.anims.play("run", true);
      }
      this.right = true;
      this.flipX = false;
      this.body.setVelocityX(this.walkVelocity);
    }else if (this.cursor.left.isDown || this.A.isDown || this.joystickCursor.left.isDown) {
      if (this.body.blocked.down) {
        if (!this.attacking ) this.anims.play("run", true);
      }
      this.right = false;
      this.flipX = true;
      this.body.setVelocityX(-this.walkVelocity);
    }else{
      if (this.body.blocked.down) {
        this.jumping = false;
        this.falling = false;
        if (!this.attacking ) this.anims.play("idle", true);
      }
      this.body.setVelocityX(0);
    }

    if (Phaser.Input.Keyboard.JustDown(this.spaceBar)) this.attack();

    //Constrain attack blow to player
    if(this.blow){
      this.blow.y = this.y;
      this.blow.x = this.x + (this.right ? 40 : -40);
    }
  }

  landSmoke() {
    this.jumpSmoke(30);
  }

  jumpSmoke(offsetY = 25, varX) {
    Array(Phaser.Math.Between(3, 6))
    .fill(0)
    .forEach((i) => {
      const offset = varX || Phaser.Math.Between(-1, 1) > 0 ? 1 : -1;
      varX = varX || Phaser.Math.Between(0, 20);
      let randSize = Phaser.Math.Between(5, 15);
      new JumpSmoke(this.scene, this.x + offset * varX, this.y + offsetY, randSize, randSize);
    });
  }

  attack() {
    if(!this.attacking && !this.dead){
      this.attacking = true;
      this.scene.time.delayedCall(this.timeBetweenAttacks, () => this.attacking = false );
      let offsetX = this.right ? 40 : -40;
      let size = 43; //Size of the base attack

      //Display Attack FX
      if(this.attackLevel > 0){
        this.scene.tweens.add({
          targets: this,
          duration: 200,
          yoyo: true,
          tint: { from: 0xffffff, to: 0xffdd55 },
        });
        this.attackFX.setFlipX(!this.right);
        //Set the size of the attack FX
        this.attackFX.setVisible(true).setScale(Math.max(1,this.attackLevel * 0.75));
        // Play appropriate animating depending on combo
        if(this.combo==0){
          this.attackFX.setDepth(3).play("fireattack1").on("animationcomplete",()=>this.attackFX.setVisible(false));
        }else{
          this.attackFX.setDepth(1).play("fireattack2").on("animationcomplete",()=>this.attackFX.setVisible(false));
        }
      }
      //Spawn an attack blow thats size is dependent on attackLevel
      this.blow = new Blow(this.scene, this.x + offsetX, this.y, size * ((this.attackLevel * 0.75) + 1), size * ((this.attackLevel * 0.5) + 1));
      this.scene.blows.add(this.blow);
      
      //Throwing Weapon attacks
      if(this.daggers>0){
        this.dagger = new Dagger(this.scene, this.x + offsetX, this.y, this.right ? "right":"left");
        this.scene.daggers.add(this.dagger);
        if(this.daggers>1){
          this.dagger2 = new Dagger(this.scene, this.x + offsetX*-1, this.y, this.right ? "left":"right");
          this.scene.daggers.add(this.dagger2);
        }
      }

      // Play appropriate animating depending on combo
      if(this.combo==0){
        this.anims.play("attack1", true);
        this.combo++;
      }else{
        this.anims.play("attack2", true);
        this.combo=0;
      }
      this.scene.playAudio("slash");
    }
  }

  turn() {
    this.right = !this.right;
  }

  animationComplete(animation, frame) {
    if (animation.key === "attack1" || animation.key === "attack2") {
      this.attacking = false;
      this.attackFX.setVisible(false);
      if(this.jumping) this.anims.play("jumpUp",true);
      if(this.falling) this.anims.play("jumpDown", true);
    }
    if (animation.key === "hurt") {
      if(this.jumping) this.anims.play("jumpUp",true);
      if(this.falling) this.anims.play("jumpDown", true);
    }
    if (animation.key === "die")
      this.setAlpha(0);
  }

  hit() {
    this.health--;
    this.hurt = true;
    this.invincible = true;
    this.hurtTween = this.scene.tweens.add({
      targets: this,
      duration: 500,
      tint: { from: 0xffffff, to: 0xff5555 },
      repeat: -1,
    });
    this.anims.play("hurt", true);
    if (this.health === 0) {
      this.die();
    }else{
      this.body.setVelocityY(-200);
      this.invincibleFlashPlayer(1);
      this.bleedingFX.emitting = true;
    }
  }

  die() {
    this.dead = true;
    this.body.immovable = true;
    this.body.moves = false;
    this.bleedingFX.emitting = false;
    this.anims.play("die", true);
  
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
    
    this.daggers = 0;
    this.scene.registry.set("daggers",0);
    this.attackLevel = 0;
    this.scene.registry.set("attackLevel",0);
    this.scene.updateHearts(-1);
    this.scene.restartScene();
  }

  setNotHurt(){
    this.hurtTween.stop();
    this.bleedingFX.emitting=false;
    this.tint = 0xffffff;
    this.hurt = false;
    this.health = 2;
  }

  /*
    When called it flashes the players alpha while invincible, then sets invincible back to false after the amount of (seconds).
    */
    invincibleFlashPlayer(seconds) {
      this.scene.tweens.add({
        targets: this,
        duration: 100,
        alpha: { from: 0.5, to: 1 },
        repeat: 10*seconds,
        onComplete: () => { this.invincible=false }
      });
    }

    /*
    This is called when the player gets a prize. It checks the prize and calls the corresponding method.
    */
  applyPrize(prize) {
    switch (prize) {
      // case "speed":
      //   this.walkVelocity = 330;
      //   this.flashPlayer();
      //   break;
      // case "boots":
      //   this.jumpVelocity = -600;
      //   this.flashPlayer();
      //   break;
      // case "star":
      //   this.invincible = true;
      //   this.scene.tweens.add({
      //     targets: this,
      //     duration: 300,
      //     alpha: { from: 0.7, to: 1 },
      //     repeat: -1,
      //   });
      //   break;
      case "dagger":
        this.daggers++;
        if(this.daggers>2) this.daggers=2;
        this.scene.registry.set("daggers", this.daggers);
        break;
      case "firesword":
        this.attackLevel++;
        if(this.attackLevel>2) this.attackLevel=2;
        this.scene.registry.set("attackLevel", this.attackLevel);
        break;
      case "heart":
        this.hurt = false;
        this.scene.updateHearts(1);
        break;
      case "coin":
        const amountOfCoins = 10;
        for(let i=0; i < amountOfCoins; i++){
          this.scene.time.delayedCall(50 * i + 500,()=>{
            this.scene.playAudio("coin");
            let coin = new Coin(this.scene,this.x,this.y).setScale(0.3);
            this.scene.coins.add(coin);
            
          })
        }
        break;
      default:
        break;
    }
  }

}

export default Player;