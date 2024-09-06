export default class Platform extends Phaser.GameObjects.Container {
  constructor(scene, x, y, size = 4, type = 0) {
    super(scene, x, y);
    this.x = x;
    this.y = y;
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    this.body.setAllowGravity(false);
    this.body.setBounce(1);
    this.body.setSize(size * 32, 32);
    this.body.setOffset(-2, -2);
    this.type = type;
    this.body.immovable = true;
    this.body.moves = false;
    this.chain = new Phaser.GameObjects.Sprite(
      this.scene,
      size * 16 - 16,
      -2048,
      "chain"
    ).setOrigin(0).setScale(0.5,1);
    this.add(this.chain);
    this.platform = new Phaser.GameObjects.Sprite(
      this.scene,
      0,
      0,
      "platform" + size
    ).setOrigin(0).setScale(0.5);
    this.add(this.platform);

    this.init();
  }

  /*
    This method generates a random platform. Depending on the result, the platform will move vertically or horizontally or both.
    */
  init() {
    let offsetX = this.x;
    let offsetY = this.y;
    console.log(this.type)
    switch (this.type) {
      case 0:
        offsetY = this.y - 150;
        break;
      case 1:
        offsetX = Phaser.Math.Between(-50, 50);
        break;
      case 2:
        offsetX = Phaser.Math.Between(-100, 100);
        offsetY = Phaser.Math.Between(-100, 100);
        break;
      case 3:
      case 4:
      case 5:
      case 6:
      default:
        break;
    }

    this.scene.tweens.add({
      targets: this,
      duration: 5000,
      x: { from: this.x, to: offsetX },
      y: { from: this.y, to: offsetY },
      repeat: -1,
      yoyo: true,
    });
  }
}
