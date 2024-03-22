class LoadingScene extends Phaser.Scene {
  constructor() {
    super('Loading');
  }

  preload() {
    this.load.pixelArt = true;

    this.load.json('level:0', './assets/data/level00.json');
    this.load.json('level:1', './assets/data/level01.json');

    this.load.image('background', './assets/images/background.png');
    this.load.image('ground', './assets/images/ground.png');
    this.load.image('grass:8x1', './assets/images/grass_8x1.png');
    this.load.image('grass:6x1', './assets/images/grass_6x1.png');
    this.load.image('grass:4x1', './assets/images/grass_4x1.png');
    this.load.image('grass:2x1', './assets/images/grass_2x1.png');
    this.load.image('grass:1x1', './assets/images/grass_1x1.png');
    this.load.image('invisible-wall', './assets/images/invisible_wall.png');
    this.load.image('key', './assets/images/key.png');
    this.load.image('icon:coin', './assets/images/coin_icon.png');

    this.load.spritesheet('font:numbers', './assets/images/numbers.png', { frameWidth: 20, frameHeight: 26 });
    this.load.spritesheet('decoration', './assets/images/decor.png', { frameWidth: 42, frameHeight: 42 });
    this.load.spritesheet('hero', './assets/images/hero.png', { frameWidth: 36, frameHeight: 42 });
    this.load.spritesheet('spider', './assets/images/spider.png', { frameWidth: 42, frameHeight: 32 });
    this.load.spritesheet('coin', './assets/images/coin_animated.png', { frameWidth: 22, frameHeight: 22 });
    this.load.spritesheet('icon:key', './assets/images/key_icon.png', { frameWidth: 34, frameHeight: 30 });
    this.load.spritesheet('door', './assets/images/door.png', { frameWidth: 42, frameHeight: 66 });

    this.load.audio('bgm', ['./assets/audio/bgm.mp3', './assets/audio/bgm.ogg']);
    this.load.audio('sfx:jump', './assets/audio/jump.wav');
    this.load.audio('sfx:coin', './assets/audio/coin.wav');
    this.load.audio('sfx:stomp', './assets/audio/stomp.wav');
    this.load.audio('sfx:key', './assets/audio/key.wav');
    this.load.audio('sfx:door', './assets/audio/door.wav');
  }

  create() {
    this.scene.start('Play', { level: 0 });
  }
}