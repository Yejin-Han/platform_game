class Hero extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'hero');

    scene.physics.world.enable(this);
    this.body.collideWorldBounds = true;

    this.createAnimations(scene);
    this.anims.play('stop');

    this.alive = true;
    this.isFrozen = false;
    this.isBoosting = false;
  }

  createAnimations(scene) {
    if(!scene.anims.exists('stop')) {
      scene.anims.create({
        key: 'stop',
        frames: [{ key: 'hero', frame: 0 }]
      });
    }

    if(!scene.anims.exists('run')) {
      scene.anims.create({
        key: 'run',
        frames: scene.anims.generateFrameNumbers('hero', { start: 1, end: 2 }),
        frameRate: 8,
        repeat: -1,
      });
    }

    if(!scene.anims.exists('jump')) {
      scene.anims.create({
        key: 'jump',
        frames: [{ key: 'hero', frame: 3 }]
      });
    }


    if(!scene.anims.exists('fall')) {
      scene.anims.create({
        key: 'fall',
        frames: [{ key: 'hero', frame: 4 }]
      });
    }


    if(!scene.anims.exists('heroDie')) {
      scene.anims.create({
        key: 'heroDie',
        frames: this.anims.generateFrameNumbers('hero', { frames: [5, 6, 5, 6, 5, 6, 5, 6] }),
        frameRate: 12,
        repeat: 0,
      });
    }
  }

  move(direction) {
    if(this.isFrozen || !this.body) return;

    const SPEED = 200;
    this.body.setVelocityX(direction * SPEED);

    if(direction < 0) this.flipX = true;
    else if(direction > 0) this.flipX = false;
  }

  jump() {
    const JUMP_SPEED = 600;
    let canJump = this.body.touching.down && this.alive && !this.isFrozen;

    if(canJump || this.isBoosting) {
      this.body.setVelocityY(-JUMP_SPEED);
      this.isBoosting = true;
      return true;
    }

    return false;
  }

  stopJumpBoost() {
    this.isBoosting = false;
  }

  bounce() {
    const BOUNCE_SPEED = 200;
    this.body.setVelocityY(-BOUNCE_SPEED);
  }

  update() {
    if(this.body) {
      const animationName = this.getAnimationName();
      if(this.anims.currentAnim.key !== animationName) {
        this.anims.play(animationName);
      }
    }
  }

  freeze() {
    this.isFrozen = true;
    this.body.enable = false;
  }

  die() {
    this.alive = false;
    this.body.enable = false;

    this.anims.play('heroDie').once('animationcomplete', () => {
      this.destroy();
    });
  }

  getAnimationName() {
    if(!this.alive) return 'heroDie';
    if(this.isFrozen) return 'stop';
    if(this.body.velocity.y < 0) return 'jump';
    if(this.body.velocity.y > 0 && !this.body.touching.down) return 'fall';
    if(this.body.velocity.x !== 0 && this.body.touching.down) return 'run';
    return 'stop';
  }
}