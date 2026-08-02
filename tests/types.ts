import Kineto, { reveal, slider, type KinetoInstance, type KinetoModule } from '@dong-gri/kineto';
import ModularCore from '@dong-gri/kineto/core';
import sliderModule from '@dong-gri/kineto/modules/slider';

const target = document.createElement('div');
const result: KinetoInstance | KinetoInstance[] | null = reveal(target, { preset: 'fade-up' });
slider(target, { infinite: false });
Kineto.create('reveal', target, { duration: 0.3 });
Kineto.destroyModule(target, 'reveal').refresh();

const moduleDefinition: KinetoModule = sliderModule;
ModularCore.register('slider', moduleDefinition).slider(target);

void result;
