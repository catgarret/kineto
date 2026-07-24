import './kineto.css';
import Kineto from './core.js';
import parallaxModule from './modules/parallax.js';
import mouseParallaxModule from './modules/mouseParallax.js';
import revealModule from './modules/reveal.js';
import counterModule from './modules/counter.js';
import lazyModule from './modules/lazy.js';
import textSplitModule from './modules/textSplit.js';
import blurTextModule from './modules/blurText.js';
import shuffleModule from './modules/shuffle.js';
import typewriterModule from './modules/typewriter.js';
import textRevealModule from './modules/textReveal.js';
import textTransitionModule from './modules/textTransition.js';
import magneticModule from './modules/magnetic.js';
import marqueeModule from './modules/marquee.js';
import overflowTextModule from './modules/overflowText.js';
import loaderModule from './modules/loader.js';
import tiltModule from './modules/tilt.js';
import cursorModule from './modules/cursor.js';
import textFillModule from './modules/textFill.js';
import stickyStackModule from './modules/stickyStack.js';
import scrollVelocityModule from './modules/scrollVelocity.js';
import progressModule from './modules/progress.js';
import sliderModule from './modules/slider.js';
import ambientMediaModule from './modules/ambientMedia.js';
import pageRevealModule from './modules/pageReveal.js';
import glitchModule from './modules/glitch.js';
import cardGlowModule from './modules/cardGlow.js';
import lightboxModule from './modules/lightbox.js';
import pageTransitionModule from './modules/pageTransition.js';
import vibrateModule from './modules/vibrate.js';
import rippleModule from './modules/ripple.js';
import cssScrollModule from './modules/cssScroll.js';
import scrollSequenceModule from './modules/scrollSequence.js';
import brushRevealModule from './modules/brushReveal.js';
import fullpageModule from './modules/fullpage.js';
import confettiModule from './modules/confetti.js';
import accordionModule from './modules/accordion.js';
import holdModule from './modules/hold.js';

const moduleEntries = {
  parallax: parallaxModule,
  mouseParallax: mouseParallaxModule,
  reveal: revealModule,
  counter: counterModule,
  lazy: lazyModule,
  textSplit: textSplitModule,
  blurText: blurTextModule,
  shuffle: shuffleModule,
  typewriter: typewriterModule,
  textReveal: textRevealModule,
  textTransition: textTransitionModule,
  magnetic: magneticModule,
  marquee: marqueeModule,
  overflowText: overflowTextModule,
  loader: loaderModule,
  tilt: tiltModule,
  cursor: cursorModule,
  textFill: textFillModule,
  stickyStack: stickyStackModule,
  scrollVelocity: scrollVelocityModule,
  progress: progressModule,
  slider: sliderModule,
  ambientMedia: ambientMediaModule,
  pageReveal: pageRevealModule,
  glitch: glitchModule,
  cardGlow: cardGlowModule,
  lightbox: lightboxModule,
  pageTransition: pageTransitionModule,
  vibrate: vibrateModule,
  ripple: rippleModule,
  cssScroll: cssScrollModule,
  scrollSequence: scrollSequenceModule,
  brushReveal: brushRevealModule,
  fullpage: fullpageModule,
  confetti: confettiModule,
  accordion: accordionModule,
  hold: holdModule
};

Object.entries(moduleEntries).forEach(([name, module]) => Kineto.register(name, module));

const call = (name) => (target, options) => Kineto[name](target, options);

export const parallax = call('parallax');
export const mouseParallax = call('mouseParallax');
export const reveal = call('reveal');
export const counter = call('counter');
export const lazy = call('lazy');
export const textSplit = call('textSplit');
export const blurText = call('blurText');
export const shuffle = call('shuffle');
export const typewriter = call('typewriter');
export const textReveal = call('textReveal');
export const textTransition = call('textTransition');
export const magnetic = call('magnetic');
export const marquee = call('marquee');
export const overflowText = call('overflowText');
export const loader = call('loader');
export const tilt = call('tilt');
export const cursor = call('cursor');
export const textFill = call('textFill');
export const stickyStack = call('stickyStack');
export const scrollVelocity = call('scrollVelocity');
export const progress = call('progress');
export const slider = call('slider');
export const ambientMedia = call('ambientMedia');
export const pageReveal = call('pageReveal');
export const glitch = call('glitch');
export const cardGlow = call('cardGlow');
export const lightbox = call('lightbox');
export const pageTransition = call('pageTransition');
export const vibrate = call('vibrate');
export const ripple = call('ripple');
export const cssScroll = call('cssScroll');
export const scrollSequence = call('scrollSequence');
export const brushReveal = call('brushReveal');
export const fullpage = call('fullpage');
export const confetti = call('confetti');
export const accordion = call('accordion');
export const hold = call('hold');

export { moduleEntries as modules };
export default Kineto;
