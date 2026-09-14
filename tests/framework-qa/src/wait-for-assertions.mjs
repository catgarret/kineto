// Test-only synchronization: preserve every assertion and report the last
// observed failure if the browser never reaches the required state.
export async function waitForAssertions(assertions, { timeout = 2000, interval = 16 } = {}) {
  const start = performance.now();
  for (;;) {
    try {
      assertions();
      return;
    } catch (cause) {
      const remaining = timeout - (performance.now() - start);
      if (remaining <= 0) throw new Error(`Framework state did not settle within ${timeout}ms: ${cause.message}`, { cause });
      await new Promise((resolve) => setTimeout(resolve, Math.min(interval, remaining)));
    }
  }
}
