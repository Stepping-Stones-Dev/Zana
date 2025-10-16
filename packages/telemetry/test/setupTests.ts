// Reduce console noise during telemetry tests
const originalLog = console.log;
console.log = (...args: any[]) => {
  if (typeof args[0] === 'string' && args[0].startsWith('[event:')) {
    return;
  }
  originalLog(...args);
};
