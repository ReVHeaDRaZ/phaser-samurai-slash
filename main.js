import './style.css';
import Phaser from 'phaser';
import Bootloader from './bootloader';
import Splash from './splash';
import Outro from './outro';
import Transition from './transition';
import GameScene from './game';
import { sizes } from './sizes';
import VirtualJoystickPlugin from 'phaser3-rex-plugins/plugins/virtualjoystick-plugin.js';

const config = {
  type: Phaser.WEBGL,
  width: sizes.width,
  height: sizes.height,
  scale: {
    mode: Phaser.Scale.FIT,
    // autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  canvas: gameCanvas,
  physics: {
    default: "arcade",
    arcade:{
      gravity:{y: 800},
      debug: true
    }
  },
  plugins: {
    global: [{
        key: 'rexVirtualJoystick',
        plugin: VirtualJoystickPlugin,
        start: true
    },
    ]
  },
  scene: [Bootloader, Splash, Transition, GameScene, Outro]
}

const game = new Phaser.Game(config);