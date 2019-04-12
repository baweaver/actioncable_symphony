// import timesync from 'timesync';
const timesync = require('timesync');

export default class Clock {
  constructor({ onChange = x => x }) {
    this.syncronizer = timesync.create({
      server: '/timesync',
      interval: 5000
    });

    this.syncronizer.on('change', onChange.bind(this));
  }

  onChange(fn) {
    this.syncronizer.on('change', fn);
  }

  now() {
    return new Date(this.syncronizer.now());
  }

  offset() {
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
