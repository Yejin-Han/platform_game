class Spider extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'spider');

    scene.physics.world.enable(this);
    this.body.collideWorldBounds = true;
  
    this.createAnimations(scene);
    this.anims.play('crawl');

    this.spiderSPEED = 100;
    this.hasStarted = false;
  }

  createAnimations(scene) {
    if(!scene.anims.exists('crawl')) {
      scene.anims.create({
        key: 'crawl',
        frames: scene.anims.generateFrameNumbers('spider', { start: 0, end: 2 }),
        frameRate: 8,
        repeat: -1,
      });
    }
    
    if(!scene.anims.exists('spiderDie')) {
      scene.anims.create({
        key: 'spiderDie',
        frames: scene.anims.generateFrameNumbers('spider', { frames: [0, 4, 0, 4, 0, 4, 3, 3, 3, 3, 3, 3] }),
        frameRate: 12,
        repeat: 0,
      });
    }
  }

  update() {
    if(!this.hasStarted) {
      this.body.setVelocityX(this.spiderSPEED);
      this.hasStarted = true;
    }

    if(this.body.touching.right || this.body.blocked.right) {
      this.body.setVelocityX(-this.spiderSPEED);
    } else if(this.body.touching.left || this.body.blocked.left) {
      this.body.setVelocityX(this.spiderSPEED);
    }
  }

  die() {
    this.body.enable = false;

    this.anims.play('spiderDie').once('animationcomplete', () => {
      this.destroy();
    });
  }
}