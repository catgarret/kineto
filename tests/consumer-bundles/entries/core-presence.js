import Kineto from '@dong-gri/kineto/core';
import presence from '@dong-gri/kineto/presence';

const cardPresence = presence(null, { mode: 'wait' });
globalThis.__kinetoConsumerFixture = { Kineto, cardPresence };
