import Phaser from 'phaser'
import Blow from './blow';
import { JumpSmoke } from "./particle";
import { sizes } from './sizes';

class Player extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, health = 2) {
    super(scene, x, y, "player");
    this.setOrigin(0.5);
    this.setScale(2);
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    
    this.cursor = this.scene.input.keyboard.createCursorKeys();
    this.spaceBar = this.scene.input.keyboard.addKey( Phaser.Input.Keyboard.KeyCodes.SPACE );
    this.W = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.A = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.S = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.D = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    this.scene.add.rectangle(0, sizes.height, sizes.width, sizes.controlsHeight, 0x181818).setOrigin(0).setScrollFactor(0);
    this.joystick = this.scene.plugins.get('rexVirtualJoystick').add(this.scene, {
      x: sizes.controlsOffset,
      y: sizes.height + sizes.controlsHeight - sizes.controlsOffset,
      radius: 100,
      base: this.scene.add.image(0,0, 'moveButton').setDisplaySize(108, 108).setAlpha(0.01),
      thumb: this.scene.add.image(0, 0, 'moveButton').setDisplaySize(64, 64).setAlpha(0.25),
      dir: 'left&right',
      // forceMin: 16,
      // fixed: true,
      // enable: true
    });
    this.attackButton = scene.plugins.get('rexButton')
      .add(this.scene.add.sprite(sizes.width-sizes.controlsOffset*0.75, sizes.height + sizes.controlsHeight - sizes.controlsOffset,"attackButton")
      .setAlpha(0.25).setScrollFactor(0), {
        // enable: true,
        mode: 0,              // 0|'press'|1|'release'
        // clickInterval: 100    // ms
        // threshold: undefined
    });
    this.jumpButton = scene.plugins.get('rexButton')
      .add(this.scene.add.sprite(sizes.width-sizes.controlsOffset*2, sizes.height + sizes.controlsHeight - sizes.controlsOffset,"jumpButton")
      .setAlpha(0.25).setScrollFactor(0), {
        // enable: true,
        mode: 0,              // 0|'press'|1|'release'
        // clickInterval: 100    // ms
        // threshold: undefined
    });
    this.jumpButtonPressed = false;
    this.scene.input.addPointer(1);
    this.joystickCursor = this.joystick.createCursorKeys();
    this.attackButton.on('down', () => this.attack());
    this.jumpButton.on('down', () => this.jumpButtonPressed=true);
   


    this.right = true;
    this.body.setSize(20, 30);
    this.body.setBounce(0.001);
    this.body.setCollideWorldBounds(true);
    this.init();
    this.jumping = false;
    this.falling = false;
    this.attacking = false;
    this.timeBetweenAttacks = 300;
    this.walkVelocity = 200;
    this.jumpVelocity = -400;
    this.invincible = false;
    this.health = health;
    this.hurt = false;
    this.hurtTween = null;
    this.dead = false;
    this.combo = 0; 
  }

  init() {
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
      frameRate: 15,
      repeat: -1
    });

    this.anims.play("idle", true);
    this.on("animationcomplete", this.animationComplete, this);
  }

  update() {
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
      if(this.combo==0){
        this.anims.play("attack1", true);
        this.combo++;
      }else{
        this.anims.play("attack2", true);
        this.combo=0;
      }

      this.attacking = true;
      this.scene.time.delayedCall(this.timeBetweenAttacks, () => this.attacking = false );
      const offsetX = this.right ? 40 : -40;
      const size = 42;
      this.scene.blows.add(new Blow(this.scene, this.x + offsetX, this.y, size, size/2));
      this.scene.playAudio("slash");
    }
  }

  turn() {
    this.right = !this.right;
  }

  animationComplete(animation, frame) {
    if (animation.key === "attack1" || animation.key === "attack2") {
      this.attacking = false;
      if(this.jumping) this.anims.play("jumpUp",true);
      if(this.falling) this.anims.play("jumpDown", true);
    }
    if (animation.key === "hurt") {
      if(this.jumping) this.anims.play("jumpUp",true);
      if(this.falling) this.anims.play("jumpDown", true);
    }
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
      this.flashPlayer();
    }
  }

  die() {
    this.dead = true;
    this.anims.play("die", true);
    this.body.immovable = true;
    this.body.moves = false;
    this.scene.updateHearts(-1);
    this.scene.restartScene();
  }

  setNotHurt(){
    this.hurtTween.stop();
    this.tint = 0xffffff;
    this.hurt = false;
    this.health = 2;
  }

  setCanAttack(){
    console.log(this);
    this.attacking = false;
  }
  /*
    When called it flashes the player while invincible, then set invisible to false after 1 sec.
    */
    flashPlayer() {
      this.scene.tweens.add({
        targets: this,
        duration: 100,
        alpha: { from: 0.5, to: 1 },
        repeat: 10,
        onComplete: () => {this.invincible=false}
      });
    }

}

export default Player;