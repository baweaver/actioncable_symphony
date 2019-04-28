// import timesync from 'timesync';
const timesync = require('timesync');

export class Clock {
  constructor({ onChange = x => x }) {
    this.onChange  = onChange.bind(this);
    this.active    = false;
    this.offset    = 0;
    this.callbacks = {
      change: []
    };
  }

  on(event, fn) {
    if (!this.callbacks[event]) this.callbacks[event] = [];

    this.callbacks[event].push(fn)
  }

  start() {
    this.syncronizer = timesync.create({
      server: '/timesync',
      interval: 5000
    });

    const nativeOnChange = this.onChange.bind(this);

    this.syncronizer.on('change', (newOffset) => {
      nativeOnChange(newOffset)
      this.callbacks.change.forEach(fn => fn(newOffset));
    });

    this.active = true;
  }

  now() {
    if (!this.active) return;

    return new Date(this.syncronizer.now());
  }

  currentOffset() {
    return this.offset || 0;
  }
}
