function timedOut (maxWait) {
  const startTime = Date.now();

  return () => Date.now() - startTime > maxWait;
}

export function waitUntilTime(timestamp, clock, action) {
  const arrivalTime = timestamp - clock.now();

  waitUntil(() => clock.now() >= timestamp, 5)
    .then(() => action());
}

export function waitUntil(condition, interval = 500) {
  return new Promise((resolve, reject) => {
    const isTimedOut = timedOut(10000);

    const waitInterval = setInterval(() => {
      if (condition()) {
        clearInterval(waitInterval);
        return resolve();
      }

      if (isTimedOut()) {
        clearInterval(waitInterval);
        return reject('Request timed out!');
      }
    }, interval);
  });
}

export function waitUntilConnected (channel) {
  return waitUntil(() => channel.consumer.connection.isOpen());
}
