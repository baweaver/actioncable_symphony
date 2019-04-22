// import timesync from 'timesync';
const timesync = require('timesync');

export class Clock {
  constructor({ onChange = x => x }) {
    this.onChange = onChange.bind(this);
    this.active   = false;
    this.offset   = 0;
  }

  start() {
    this.syncronizer = timesync.create({
      server: '/timesync',
      interval: 10000
    });

    this.syncronizer.on('change', this.onChange.bind(this));

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

// const Sync = timesync.create({
//   server: '/timesync',
//   interval: 10000
// });

// // get notified on changes in the offset
// Sync.on('change', offset => {
//   console.log(`changed offset: ${offset} ms`);
// });

// // get synchronized time
// setInterval(() => {
//   const now = new Date(Sync.now());

//   console.log(`now: ${now.toISOString()} ms`);
// }, 1000);
