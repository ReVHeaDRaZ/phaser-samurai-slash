import '../style.css';
import Phaser from 'phaser';
import Bootloader from './scenes/bootloader';
import Splash from './scenes/splash';
import Outro from './scenes/outro';
import Transition from './scenes/transition';
import GameScene from './scenes/game';
import { sizes } from './sizes';
import VirtualJoystickPlugin from 'phaser3-rex-plugins/plugins/virtualjoystick-plugin.js';
import ButtonPlugin from 'phaser3-rex-plugins/plugins/button-plugin.js';

const config = {
  type: Phaser.WEBGL,
  width: sizes.width,
  height: sizes.height + sizes.controlsHeight,
  scale: {
    mode: Phaser.Scale.FIT,
    // autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  canvas: gameCanvas,
  physics: {
    default: "arcade",
    arcade:{
      gravity:{y: 800},
      //debug: true
    }
  },
  plugins: {
    global: [{
        key: 'rexVirtualJoystick',
        plugin: VirtualJoystickPlugin,
        start: true
    },
    {
      key: 'rexButton',
      plugin: ButtonPlugin,
      start: true
    },
    ]
  },
  scene: [Bootloader, Splash, Transition, GameScene, Outro]
}

const game = new Phaser.Game(config);