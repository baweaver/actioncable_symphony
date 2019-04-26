function timedOut (maxWait) {
  const startTime = Date.now();

  return () => Date.now() - startTime > maxWait;
}

export function waitUntilTime(timestamp, clock, action) {
  const arrivalTime = timestamp - clock.now();

  setTimeout(action, arrivalTime);
}

export function waitUntil(condition) {
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
    }, 500);
  });
}

export function waitUntilConnected (channel) {
  return waitUntil(() => channel.consumer.connection.isOpen());
}
