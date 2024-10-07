import Phaser from "phaser";
import Player from '../gameobjects/player';
import Coin from "../gameobjects/coin";
import Turn from "../gameobjects/turn";
import Zombie from "../gameobjects/zombie";
import Bat from "../gameobjects/bat";
import { sizes } from '../sizes';
import Heart from "../gameobjects/heart";
import Platform from "../gameobjects/platform";
import Chest from "../gameobjects/chest";
import Dagger from "../gameobjects/dagger";
import Fireworm from "../gameobjects/fireworm";
import ShadowMonster from "../gameobjects/shadowmonster";

export default class GameScene extends Phaser.Scene{
  constructor(){
    super("game");
    this.player = null;
    this.score = 0;
    this.scoreText = null;
    this.levelFinished = false;
  }

  init(data) {
    this.name = data.name;
    this.number = data.number;
  }

  preload(){}

  create(){
    this.levelFinished = false;
    this.cameras.main.setBackgroundColor(0x181818); //(0x00b140)//(0x62a2bf)
    
    this.createParallaxBackground();
    this.createMap();
    
    this.cameras.main.setBounds(0, 0, 20920 * 2, 20080 * 2);
    this.physics.world.setBounds(0, 0, 20920 * 2, 20080 * 2);
    this.addPlayer();

    this.cameras.main.startFollow(this.player, true, 0.05, 0.05, 0, 1200);
    this.physics.world.enable([this.player]);
    
    this.loadAudios();
    this.playMusic();
    this.addHUD();
  }
  update(){
    this.player.update();
    for(let i=0; i<this.backgrounds.length; i++){
      const bg = this.backgrounds[i];
      bg.sprite.tilePositionX = this.cameras.main.scrollX * bg.ratioX;
    }

    // If player falls to death
    if (this.player.y > 540 && !this.player.dead){
      this.player.dead = true;
      this.registry.set("daggers",0);
      this.registry.set("attackLevel",0);
      this.updateHearts(-1);
      this.restartScene();
    }
  }


  createParallaxBackground(){
    this.backgrounds = [];
    this.add.tileSprite(0, 0, sizes.width, sizes.height, "bg1").setOrigin(0).setScale(3).setScrollFactor(0,0).setTint(0x333333);
    this.backgrounds.push({
      ratioX: 0.1,
      sprite: this.add.tileSprite(0, 0, sizes.width, sizes.height, "bg2").setOrigin(0).setScale(3).setScrollFactor(0,0).setTint(0x444444)
    })
    this.backgrounds.push({
      ratioX: 0.2,
      sprite: this.add.tileSprite(0, 0, sizes.width, sizes.height, "bg3").setOrigin(0).setScale(3).setScrollFactor(0,0).setTint(0x777777)
    })
    
  }

  createMap() {
    this.tileMap = this.make.tilemap({
      key: "scene" + this.number,
      tileWidth: 24,
      tileHeight: 24,
    });

   this.tileSetBg = this.tileMap.addTilesetImage("background");
    this.tileMap.createLayer("background", this.tileSetBg).setPipeline("Light2D");

    this.tileSet = this.tileMap.addTilesetImage("oak_woods");
    this.platform = this.tileMap.createLayer("tileLayer" + this.number, this.tileSet).setPipeline("Light2D");
    this.platform.setCollisionByExclusion([-1]); 
    this.objectsLayer = this.tileMap.getObjectLayer("objects");

    this.zombieGroup = this.add.group();
    this.batGroup = this.add.group();
    this.firewormGroup = this.add.group();
    this.firewormGroup.runChildUpdate = true;
    this.fireballs = this.add.group();
    this.fireballs.runChildUpdate = true;
    this.shadowmonsterGroup = this.add.group();
    this.shadowmonsterGroup.runChildUpdate = true;
    this.foesGroup = this.add.group();
    this.turnGroup = this.add.group();
    this.exitGroup = this.add.group();
    this.coins = this.add.group();
    this.hearts = this.add.group();
    this.blows = this.add.group();
    this.daggers = this.add.group();
    this.platformGroup = this.add.group();
    this.chests = this.add.group();

    this.addsObjects();
    this.addColliders();

    this.lights.enable().setAmbientColor(0x888888);
    
    //this.shadowmonster = new ShadowMonster(this,280,400);
    //this.shadowmonsterGroup.add(this.shadowmonster);
  }

  /*
    This function adds the objects defined on the objects layer of the tilemap to the game.
  */
  addsObjects() {
    this.objectsLayer.objects.forEach((object) => {
      if (object.name === "zombie") {
        let zombie = new Zombie(this, object.x, object.y, object.type);
        this.zombieGroup.add(zombie);
        this.foesGroup.add(zombie);
      }
      if (object.name === "bat") {
        let bat = new Bat(this, object.x, object.y, object.type);
        this.batGroup.add(bat);
        this.foesGroup.add(bat);
      }
      if (object.name === "fireworm") {
        let fireworm = new Fireworm(this, object.x, object.y, object.type);
        this.firewormGroup.add(fireworm);
        this.foesGroup.add(fireworm);
      }
      if (object.name === "shadowmonster") {
        let shadowmonster = new ShadowMonster(this, object.x, object.y, object.type);
        this.shadowmonsterGroup.add(shadowmonster);
        this.foesGroup.add(shadowmonster);
      }
      if (object.name === "coin") {
        let coin = new Coin(this, object.x, object.y);
        this.coins.add(coin);
      }
      if (object.name === "heart") {
        let heart = new Heart(this, object.x, object.y);
        this.hearts.add(heart);
      }
      if (object.name === "chest") {
        this.chests.add(new Chest(this, object.x, object.y));
      }
      if (object.name === "platform") {
        this.platformGroup.add(
          new Platform(this, object.x, object.y, +object.properties[1].value, +object.properties[0].value)
        );
      }
      if (object.name === "turn") {
        this.turnGroup.add(new Turn(this, object.x, object.y, object.width, object.height));
      }
      if (object.name === "lamp") {
        this.lights.addLight(object.x, object.y, 300,0xfce190,0.95);
      }

      if (object.name === "text") {
        let text = object.text.text;
        if(!this.registry.get("desktop")){
          text = text.replace("UP", "JUMP");
          text = text.replace("SPACE","ATTACK");
        }
        this.add
          .bitmapText(object.x, object.y, "pixelFont", text, 15)
          .setDropShadow(1, 2, 0x222222, 0.9)
          .setOrigin(0);
      }

      if (object.name === "endLevel") {
        this.exitGroup.add(
          new Turn(
            this,
            object.x,
            object.y,
            object.width,
            object.height,
            object.type
          )
        );
        this.exitDoor = this.add.sprite(object.x,object.y,"demon_door").setScale(1).setOrigin(0);
        if(!this.anims.exists("demon_door")){
          this.anims.create({
            key: "demon_door",
            frames: this.anims.generateFrameNumbers('demon_door', {start:0, end:3}),
            frameRate: 5,
            repeat: 0,
          });
          this.anims.create({
            key: "demon_door_open",
            frames: this.anims.generateFrameNumbers('demon_door', {start:3, end:3}),
            frameRate: 1,
            repeat: -1,
          });
        }
      }
    });
  }

  addColliders() {
    this.physics.add.collider(
      this.zombieGroup,
      this.turnGroup,
      this.turnFoe,
      () => {
        return true;
      },
      this
    );
    this.physics.add.collider(
      this.batGroup,
      this.turnGroup,
      this.turnFoe,
      () => {
        return true;
      },
      this
    );
    this.physics.add.collider(
      this.firewormGroup,
      this.turnGroup,
      this.turnFoe,
      () => {
        return true;
      },
      this
    );
    this.physics.add.collider(
      this.shadowmonsterGroup,
      this.turnGroup,
      this.turnFoe,
      () => {
        return true;
      },
      this
    );
    this.physics.add.collider(
      this.fireballs,
      this.platform,
      this.turnFoe,
      () => {
        return true;
      },
      this
    );
    this.physics.add.collider(
      this.batGroup,
      this.platform,
      this.turnFoe,
      () => {
        return true;
      },
      this
    );
    // this.physics.add.collider(
    //   this.batGroup,
    //   this.platformGroup,
    //   this.turnFoe,
    //   () => {
    //     return true;
    //   },
    //   this
    // );

    this.physics.add.collider(this.zombieGroup, this.platform);
    this.physics.add.collider(this.firewormGroup, this.platform);
    this.physics.add.collider(this.shadowmonsterGroup, this.platform);
  }


  /*
    We add the player to the game and we add the colliders between the player and the rest of the elements. The starting position of the player is defined on the tilemap.
    */
    addPlayer() {
      const playerPosition = this.objectsLayer.objects.find(
        (object) => object.name === "playerStart"
      );
      this.player = new Player(this, playerPosition.x, playerPosition.y, 2, this.registry.get("daggers"), this.registry.get("attackLevel"));
  
      this.physics.add.collider(this.player, this.platform);
      this.physics.add.collider(this.player, this.platformGroup);
    
      this.physics.add.overlap(
        this.player,
        this.coins,
        this.pickCoin,
        () => {
          return true;
        },
        this
      );
      this.physics.add.overlap(
        this.player,
        this.hearts,
        this.pickHeart,
        () => {
          return true;
        },
        this
      );
    
      this.physics.add.overlap(
        this.player,
        this.exitGroup,
        () => {
          if(!this.levelFinished){
            this.levelFinished = true;
            this.exitDoor.play("demon_door",true);
            this.exitDoor.on("animationcomplete", this.doorOpen, this);
            this.playAudio("stage");
            this.time.delayedCall(1000, () => this.finishScene(), null, this);
          }
        },
        () => {
          return true;
        },
        this
      );

      this.physics.add.overlap(
        this.blows,
        this.zombieGroup,
        this.hitZombie,
        () => {
          return true;
        },
        this
      );

      this.physics.add.overlap(
        this.blows,
        this.batGroup,
        this.hitBat,
        () => {
          return true;
        },
        this
      );
      this.physics.add.overlap(
        this.blows,
        this.firewormGroup,
        this.hitFireworm,
        () => {
          return true;
        },
        this
      );
      this.physics.add.overlap(
        this.blows,
        this.shadowmonsterGroup,
        this.hitShadowmonster,
        () => {
          return true;
        },
        this
      );
      this.physics.add.overlap(
        this.blows,
        this.chests,
        this.hitChest,
        () => {
          return true;
        },
        this
      );

      this.physics.add.overlap(
        this.player,
        this.zombieGroup,
        this.hitPlayer,
        () => {
          return true;
        },
        this
      );

      this.physics.add.overlap(
        this.player,
        this.batGroup,
        this.hitPlayer,
        () => {
          return true;
        },
        this
      );

      this.physics.add.overlap(
        this.player,
        this.firewormGroup,
        this.hitPlayer,
        () => {
          return true;
        },
        this
      );

      this.physics.add.overlap(
        this.player,
        this.fireballs,
        this.hitPlayer,
        () => {
          return true;
        },
        this
      );

      this.physics.add.overlap(
        this.player,
        this.shadowmonsterGroup,
        this.hitPlayer,
        (player, shadowmonster) => {
          if(!shadowmonster.attacking)
            return false;
        },
        this
      );

      this.physics.add.overlap(
        this.daggers,
        this.zombieGroup,
        this.hitDagger,
        () => {
          return true;
        },
        this
      );

      this.physics.add.overlap(
        this.daggers,
        this.batGroup,
        this.hitDagger,
        () => {
          return true;
        },
        this
      );
      this.physics.add.overlap(
        this.daggers,
        this.firewormGroup,
        this.hitDagger,
        () => {
          return true;
        },
        this
      );
      this.physics.add.overlap(
        this.daggers,
        this.shadowmonsterGroup,
        this.hitDagger,
        () => {
          return true;
        },
        this
      );
      this.physics.add.collider(
        this.daggers,
        this.platform,
        this.hitDagger,
        () => {
          return true;
        },
        this
      );
      this.physics.add.collider(
        this.daggers,
        this.platformGroup,
        this.hitDagger,
        () => {
          return true;
        },
        this
      );

    }

  /*
    This function is called when the player picks a coin. It disables the coin (to avoid picking it up again while it animates), plays the sound, and updates the score. Same with the hearts.
    */
  pickCoin(player, coin) {
    if (!coin.disabled) {
      coin.pick();
      this.playAudio("coin");
      this.updateCoins();
    }
  }

  spawnCoin(x,y) {
    this.time.delayedCall(
      200,
      () => {
        this.coins.add(new Coin(this, x, y));
      },
      null,
      this
    );
  }

  pickHeart(player, heart) {
    if (!heart.disabled) {
      const { x, y } = this.cameras.main.getWorldPoint(
        this.scoreHeartsLogo.x,
        this.scoreHeartsLogo.y
      );
      this.playAudio("lunchbox");
      if(!this.player.hurt){
        heart.pick(x,y);
        this.updateHearts(1);
      }
      else{
        heart.pick(x,y);
        this.player.setNotHurt();
        this.scoreHeartsLogo.play({ key: "heartscore", repeat: -1 },true);
        this.scoreHeartsLogo.setTint(0xffffff);
      }
    }
  }

  spawnHeart(x,y) {
    this.time.delayedCall(
      200,
      () => {
        this.hearts.add(new Heart(this, x, y));
      },
      null,
      this
    );
  }

  /*
    This function is called when the player is hit by a foe.
    If the player is invincible (because of a power-up), do nothing. If not, then the player is hit, and sets hurtheart on the hud.
  */
  hitPlayer(player, foe) {
    if (!player.invincible) {
      foe.turn();
      if (!player.dead) {
        player.hit();
        this.playAudio("death");
        this.scoreHeartsLogo.play({ key: "hurtheartscore", repeat: -1 },true);
        this.scoreHeartsLogo.setTint(0x999999);
        this.cameras.main.shake(100,0.01);
      }
    }
  }

  /*
    This function is called when the player hits a chest.
  */
    hitChest(player, chest) {
      if (!chest.disabled) {
        this.playAudio("swordClash");
        chest.hit();
      }
    }
  
  /*
    These functions are called when the player hits a foe. On the screen, the player generates a blow object and when this collides with a foe, the enemy is destroyed. It plays the sound and kills the foe.
  */
  hitZombie(blow, foe) {
    this.playAudio("behead");
    foe.death();
    this.spawnCoin(blow.x,blow.y);
  }
  hitBat(blow, foe) {
    this.playAudio("kill");
    foe.death();
    this.spawnCoin(blow.x,blow.y);
  }
  hitFireworm(blow, foe) {
    this.playAudio("kill");
    const hitDirection = blow.x < foe.x ? "left" : "right";
    foe.hit(hitDirection);
    if(foe.dead)
      this.spawnCoin(blow.x,blow.y);
  }
  hitShadowmonster(blow, foe) {
    this.playAudio("kill");
    const hitDirection = blow.x < foe.x ? "left" : "right";
    foe.hit(hitDirection);
    if(foe.dead)
      this.spawnCoin(blow.x,blow.y);
  }

  /*
    This is called when the daggers hits an object.
  */
    hitDagger(dagger, hit) {
      if(hit.name=="bat")
        this.hitBat(dagger, hit);
      if(hit.name=="zombie")
        this.hitZombie(dagger,hit);
      if(hit.name=="fireworm")
        this.hitFireworm(dagger,hit);
      if(hit.name=="shadowmonster")
        this.hitFireworm(dagger,hit);

      dagger.hit();
    }

  /*
    This function is called when a foe touches a turn object. It turns the foe.
    */
    turnFoe(foe, platform) {
      foe.turn();
    }

  loadAudios() {
    this.audios = {
      build: this.sound.add("build"),
      slash: this.sound.add("slash"),
      coin: this.sound.add("coin"),
      death: this.sound.add("death"),
      jump: this.sound.add("jump"),
      kill: this.sound.add("kill"),
      behead: this.sound.add("behead"),
      land: this.sound.add("land"),
      lunchbox: this.sound.add("lunchbox"),
      prize: this.sound.add("prize"),
      stone: this.sound.add("stone"),
      stage: this.sound.add("stage"),
      swordClash: this.sound.add("swordClash")
    };
  }
  playAudio(key) {
    this.audios[key].play();
  }
  playAudioRandomly(key) {
    const volume = Phaser.Math.Between(0.8, 1);
    const rate = Phaser.Math.Between(0.8, 1);
    this.audios[key].play({ volume, rate });
  }
  playMusic(theme = "game") {
    this.theme = this.sound.add("music" + this.number);
    this.theme.stop();
    this.theme.play({
    mute: false,
    volume: 0.7,
    rate: 1,
    detune: 0,
    seek: 0,
    loop: true,
    delay: 0,
    });
  }

  addHUD() {
    this.scoreCoins = this.add
      .bitmapText(65, 15, "pixelFont", "x" + this.registry.get("coins"), 15)
      .setDropShadow(0, 4, 0x222222, 0.9)
      .setOrigin(0)
      .setScrollFactor(0);
    this.scoreCoinsLogo = this.add
      .sprite(50, 25, "coin")
      .setScale(1)
      .setOrigin(0.5)
      .setScrollFactor(0);
    if(!this.anims.exists("coinscore")){
      this.anims.create({
        key: "coinscore",
        frames: this.anims.generateFrameNumbers("coin", { start: 0, end: 7 }),
        frameRate: 8,
      });
    }
    this.scoreCoinsLogo.play({ key: "coinscore", repeat: -1 });

    this.scoreHearts = this.add
      .bitmapText(sizes.width-65, 15, "pixelFont", "x" + this.registry.get("hearts"), 15)
      .setDropShadow(0, 4, 0x222222, 0.9)
      .setOrigin(0)
      .setScrollFactor(0);
    this.scoreHeartsLogo = this.add
      .sprite(sizes.width-80, 20, "heart")
      .setScale(1.5)
      .setOrigin(0.5)
      .setScrollFactor(0);
    if(!this.anims.exists("heartscore")){
      this.anims.create({
        key: "heartscore",
        frames: this.anims.generateFrameNumbers("heart", { start: 0, end: 6 }),
        frameRate: 8,
      });
      this.anims.create({
        key: "hurtheartscore",
        frames: this.anims.generateFrameNumbers("heart", { start: 9, end: 15 }),
        frameRate: 8,
      });
    }
    this.scoreHeartsLogo.play({ key: "heartscore", repeat: -1 });
  }

  /*
    This is called when the player reaches the exit. It stops the music and it starts the transition scene increasing the stage number, so we will load the next map.
    */
    finishScene() {
      if (this.theme) this.theme.stop();
      this.scene.start("transition", { name: "STAGE", number: this.number + 1 });
    }
  
    /*
      This is called when the player dies. It stops the music and it starts the transition scene without increasing the stage number.
      */
    restartScene() {
      this.time.delayedCall(
        1000,
        () => {
          if (this.theme) this.theme.stop();
          this.scene.start("transition", { name: "STAGE", number: this.number });
        },
        null,
        this
      );
    }
  
    /*
      This is called when the player picks a coin. It updates the score from the registry and it adds a little tween effect to the score text.
      */
    updateCoins() {
      const coins = +this.registry.get("coins") + 1;
      this.registry.set("coins", coins);
      this.scoreCoins.setText("x" + coins);
      this.tweens.add({
        targets: [this.scoreCoinsLogo],
        scale: { from: 1.5, to: 1 },
        duration: 50,
        repeat: 5,
      });
    }

    updateHearts(amount) {
      const hearts = +this.registry.get("hearts") + amount;
      this.registry.set("hearts", hearts);
      this.scoreHearts.setText("x" + hearts);
      
      this.tweens.add({
        targets: [this.scoreHeartsLogo],
        scale: { from: 2, to: 1.5 },
        duration: 50,
        repeat: 5,
      });
    }

    // Keeps door open at end of level
    doorOpen(){
      this.exitDoor.play("demon_door_open",true);
    }
}