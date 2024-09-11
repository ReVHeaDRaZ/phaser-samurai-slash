class Blow extends Phaser.GameObjects.Rectangle {
  constructor(scene, x, y, width = 42, height = 42, type = "") {
    super(scene, x, y, width, height, 0xffffff,0);
    this.type = type;
    this.y = y;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setAllowGravity(false);
    this.scene.tweens.add({
      targets: this,
      duration: 300,
      scale: { from: 1, to: 0.75 },
      onComplete: () => {
        this.destroy();
      },
    });

  }
}

export default Blow;