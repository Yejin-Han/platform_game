class PlayScene extends Phaser.Scene {
  constructor() {
    super('Play');

    this.LEVEL_COUNT = 2;
  }

  init(data) {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = {
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
    };

    this.hasKey = false;
    this.level = (data.level || 0) % this.LEVEL_COUNT;

    if(this.level === 0) this.coinPickupCount = 0;
  }

  create() {
    // fade-in
    this.cameras.main.flash(500, 0, 0, 0); // duration, r, g, b

    // bg
    this.add.image(0, 0, 'background').setOrigin(0);

    // audio
    this.sfx = {
      jump: this.sound.add('sfx:jump'),
      coin: this.sound.add('sfx:coin'),
      stomp: this.sound.add('sfx:stomp'),
      key: this.sound.add('sfx:key'),
      door: this.sound.add('sfx:door')
    };
    this.bgm = this.sound.add('bgm', { loop: true });
    this.bgm.play();
    
    // level setting
    this.loadLevel(this.cache.json.get(`level:${this.level}`));

    // score board
    this.createHud();
  }

  loadLevel(data) {
    this.platforms = this.physics.add.staticGroup();
    this.coins = this.physics.add.staticGroup();
    this.spiders = this.physics.add.group();
    this.enemyWalls = this.physics.add.staticGroup();
    this.bgDecoration = this.add.group();

    // spawn decorations
    data.decoration.forEach((deco) => {
      const sprite = this.add.image(deco.x, deco.y, 'decoration', deco.frame);
      this.bgDecoration.add(sprite);
    });

    // spawn platforms
    data.platforms.forEach((platform) => {
      this.spawnPlatform(platform);
    });

    // spawn coins
    data.coins.forEach((coin) => {
      this.spawnCoin(coin);
    });

    // spawn key
    this.spawnKey(data.key.x, data.key.y);

    // spawn door
    this.spawnDoor(data.door.x, data.door.y);

    // spawn hero and spiders
    this.spawnCharacters({hero: data.hero, spiders: data.spiders});
  }

  spawnCharacters(data) {
    this.hero = new Hero(this, data.hero.x, data.hero.y);
    this.add.existing(this.hero);

    data.spiders.forEach((spider) => {
      let sprite = new Spider(this, spider.x, spider.y);
      this.add.existing(sprite);
      sprite.body.allowGravity = false;
      this.spiders.add(sprite);
    });
  }

  spawnPlatform(platform) {
    const sprite = this.platforms.create(platform.x, platform.y, platform.image);

    this.spawnEnemyWall(platform.x - sprite.width / 2, platform.y - sprite.height, 'left');
    this.spawnEnemyWall(platform.x + sprite.width / 2, platform.y - sprite.height, 'right');
  }

  spawnEnemyWall (x, y, side) {
    const sprite = this.enemyWalls.create(x, y, 'invisible-wall');
    sprite.setVisible(false);
  }

  spawnCoin(coin) {
    const sprite = this.coins.create(coin.x, coin.y, 'coin');

    sprite.anims.create({
      key: 'rotate',
      frames: this.anims.generateFrameNumbers('coin', { frames: [0, 1, 2, 1] }),
      frameRate: 6,
      repeat: -1,
    });
    sprite.anims.play('rotate');
  }

  spawnKey(x, y) {
    this.key = this.physics.add.sprite(x, y, 'key');
    this.key.body.allowGravity = false;
    this.key.y -= 3;

    this.tweens.add({
      targets: this.key,
      y: this.key.y + 6,
      duration: 800,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1
    });
  }

  spawnDoor(x, y) {
    this.door = this.physics.add.sprite(x, y, 'door', 0).setOrigin(0.5, 1);
    this.door.body.allowGravity = false;
  }

  createHud() {
    this.hud = this.add.container(10, 10);

    this.keyIcon = this.add.image(0, 19, 'icon:key', 0).setOrigin(0, 0.5);
    this.hud.add(this.keyIcon);

    let coinIcon = this.add.image(this.keyIcon.width + 10, 0, 'icon:coin').setOrigin(0);
    this.hud.add(coinIcon);

    let xIcon = this.add.image(coinIcon.x + coinIcon.width + 2, coinIcon.height / 2, 'font:numbers', 10).setOrigin(0, 0.5);
    this.hud.add(xIcon);

    this.scoreContainer = this.add.container(xIcon.x + xIcon.width + 1, coinIcon.height / 2);
    let initialScore = this.add.image(0, 0, 'font:numbers', this.coinPickupCount).setOrigin(0, 0.5);
    this.scoreContainer.add(initialScore);
    this.hud.add(this.scoreContainer);
  }

  handleCollisions() {
    this.physics.add.collider(this.hero, this.platforms);
    this.physics.add.collider(this.spiders, this.platforms);
    this.physics.add.collider(this.spiders, this.enemyWalls);
    this.physics.add.overlap(this.hero, this.coins, this.onHeroVsCoin.bind(this), null, this);
    this.physics.add.overlap(this.hero, this.key, this.onHeroVsKey.bind(this), null, this);
    this.physics.add.overlap(this.hero, this.door, this.onHeroVsDoor.bind(this),
      function(hero, door) {
        return this.hasKey && hero.body.touching.down;
      }, this);
    this.physics.add.overlap(this.hero, this.spiders, this.onHeroVsEnemy.bind(this), null, this);
  }

  handleInput() {
    if(this.keys.left.isDown) {
      this.hero.move(-1);
    } else if(this.keys.right.isDown) {
      this.hero.move(1);
    } else { // stop
      this.hero.move(0);
    }

    if(this.keys.up.isDown && !this.hero.isJumping) { // JUMP_HOLD는 포기했습니다.
      let didJump = this.hero.jump();
      if(didJump) {
        this.sfx.jump.play();
        this.hero.isJumping = true;
      }
    } else if(this.keys.up.isUp) {
      this.hero.isJumping = false;

      if(this.hero.isBoosting) {
        this.hero.stopJumpBoost();
        this.hero.isBoosting = false;
      }
    }
  }

  onHeroVsCoin(hero, coin) {
    this.sfx.coin.play();
    coin.destroy();
    this.coinPickupCount++;
    this.updateScoreDisplay();
  }

  onHeroVsKey(hero, key) {
    this.sfx.key.play();
    key.destroy();
    this.hasKey = true;

    if(this.hasKey) this.keyIcon.setFrame(1);
  }

  onHeroVsDoor(hero, door) {
    this.sfx.door.play();
    door.setFrame(1);
    hero.freeze();
    let currentCoinCount = this.coinPickupCount;

    this.tweens.add({
      targets: hero,
      x: door.x,
      alpha: 0,
      duration: 500,
      ease: 'Power0',
      onComplete: () => {
        this.goToNextLevel();
        this.coinPickupCount = currentCoinCount;
      }
    });
  }

  onHeroVsEnemy(hero, enemy) {
    // 닿는 순간 hero에 y 속력이 있다 -> 점프 / 점프 후 떨어지는 중 -> 위에서 닿았다 (spider die)
    // 그 외 (hero die)
    if(hero.body.velocity.y > 0) {
      enemy.die();
      hero.bounce();
      this.sfx.stomp.play();
    } else {
      hero.die();
      this.sfx.stomp.play();

      hero.once('animationcomplete', () => {
        this.scene.restart({ level: this.level });
      }, this);

      // enemy.body.touching.none = false;
      // enemy.body.touching.down = enemy.body.wasTouching.down;
    }
  }

  goToNextLevel() {
    this.cameras.main.fadeOut(500, 0, 0, 0); // duration, r, g, b
    this.cameras.main.on('camerafadeoutcomplete', () => {
      this.scene.restart({ level: this.level + 1 });
    });
  }

  update(time, delta) {
    this.handleCollisions();
    this.handleInput();

    if(this.hero) {
      this.hero.update(time, delta);
    }

    if(this.level > 0) {
      // this.spiders.update(time, delta);
      // this.spiders.forEach((spider) => {spider.update(time, delta);});
      this.spiders.children.iterate((spider) => {
        spider.update();
      });
    }
  }

  updateScoreDisplay() {
    this.scoreContainer.removeAll(true);

    let scoreStr = `${this.coinPickupCount}`;
    for(let i = 0; i < scoreStr.length; i++) {
      let frameIndex = parseInt(scoreStr[i]);
      let digitImage = this.add.image(i * 20, 0, 'font:numbers', frameIndex).setOrigin(0, 0.5);
      this.scoreContainer.add(digitImage);
    }
  }
}