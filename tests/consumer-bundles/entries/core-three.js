import Kineto from '@dong-gri/kineto/core';
import counter from '@dong-gri/kineto/modules/counter';
import reveal from '@dong-gri/kineto/modules/reveal';
import slider from '@dong-gri/kineto/modules/slider';

Kineto.register('counter', counter);
Kineto.register('reveal', reveal);
Kineto.register('slider', slider);
globalThis.__kinetoConsumerFixture = Kineto;
