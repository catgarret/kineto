import Kineto from '@dong-gri/kineto/core';
import states from '@dong-gri/kineto/states';

const cardStates = states({
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 }
});

// Keep both imports live in the fixture: this is the supported modular
// composition a consumer uses when it wants Core plus visual states only.
globalThis.__kinetoConsumerFixture = { Kineto, cardStates };
