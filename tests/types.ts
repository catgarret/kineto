import Kineto, { reveal, slider, states, defineCanvasEffect, listCanvasEffects, type KinetoInstance, type KinetoModule, type KinetoDiagnostic, type KinetoObserverHandle } from '@dong-gri/kineto';
import ModularCore from '@dong-gri/kineto/core';
import sliderModule from '@dong-gri/kineto/modules/slider';
import modularPresence from '@dong-gri/kineto/presence';

const target = document.createElement('div');
const result: KinetoInstance | KinetoInstance[] | null = reveal(target, { preset: 'fade-up' });
slider(target, { infinite: false });
Kineto.create('reveal', target, { duration: 0.3 });
Kineto.destroyModule(target, 'reveal').refresh();
const liveDom: KinetoObserverHandle = Kineto.observe(document, { attributes: true });
const liveRoot: KinetoObserverHandle = Kineto.observe('#app', { scan: false });
void liveRoot.active;
liveDom.disconnect();

const moduleDefinition: KinetoModule = sliderModule;
ModularCore.register('slider', moduleDefinition).slider(target);
const stateController = states({ hidden: { opacity: 0 }, visible: { opacity: 1, y: 0 } });
stateController.apply(target, 'visible').cancel();
Kineto.states({ visible: { opacity: 1 } }).destroy();
const diagnostic: KinetoDiagnostic = Kineto.diagnostics.emit({
  code: Kineto.diagnosticCodes.DEBUG,
  module: 'core',
  phase: 'runtime',
  recoverable: true
});
Kineto.diagnostics.clear();
const presenceController = modularPresence(target, { mode: 'wait', accessibility: 'managed' });
presenceController.enter().cancel();
const unsubscribePresence = presenceController.subscribe((status, presenceResult) => {
  const nextStatus: 'idle' | 'entering' | 'leaving' | 'finished' | 'skipped' | 'error' | 'destroyed' = status;
  void nextStatus;
  void presenceResult?.reason;
});
unsubscribePresence();
modularPresence(target).destroy();

// Canvas Effect: a typed definition, both registration paths, and the descriptors.
const effectName: string = defineCanvasEffect('typed-grid', {
  context: '2d',
  options: { color: '#fff', size: 24 },
  setup: () => ({ cells: [] as number[] }),
  frame(api) {
    const size: number = api.options.size;
    const inside: boolean = api.pointer.inside;
    void size;
    return inside;
  }
});
Kineto.defineCanvasEffect('typed-shader', { fragment: 'void main(){gl_FragColor=vec4(1.0);}', options: { speed: 1 } });
const effectNames: string[] = listCanvasEffects().map((effect) => effect.name);
Kineto.canvasEffect(target, { effect: effectName });
void effectNames;

void result;
void diagnostic;
