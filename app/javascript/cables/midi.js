// frontend/client/midi.js
// import createChannel from "cables/actioncable";

import cable from 'actioncable';
import { waitUntilConnected, waitUntilTime } from 'util/async_tools';
import Clock from 'timesync/clock';

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export default class MidiChannel {
  constructor(player) {
    console.log('Creating')
    this.consumer = cable.createConsumer();
    this.noteQueue = [];
    this.player = player;
    this.callbacks = [];
    // this.clock = new Clock({
    //   onChange(offset) {
    //     this.offset = offset;
    //     console.log(`changed offset: ${offset} ms`);
    //   }
    // });
  }

  on(event, fn) {
    this.callbacks[`on${capitalize(event)}`] = fn;
  }

  attachToInstrument({ seek, limit }) {
    console.log('attaching')
    this.noteQueue = [];
    this.channel.attach({ seek, limit });

    if (this.callbacks.onInstrument) {
      this.callbacks.onInstrument(this.instrument);
    }
  }

  connect({ type }) {
    console.log('connecting...');

    const klass = this;

    this.instrument = type;

    this.clock = new Clock({
      onChange(offset) {
        this.offset = offset;
      }
    });

    this.channel = this.consumer.subscriptions.create({
      channel: "MidiChannel", type
    }, {
      connected(data) {
        console.log('connected', data);

        return waitUntilConnected(this);
      },

      disconnected(data) {
        console.log('disconnected', data);
      },

      received({ type, message }) {
        if (type !== 'note') console.log('received', { type, message });

        switch (type) {
          case 'note':   return klass.noteQueue.push(message);
          case 'attach': return this.attach(message);
        }
      },

      attach({ seek, limit }) {
        klass.seek = seek || 0;

        console.log({
          attachment: true, type: klass.instrument, seek, limit
        });

        const result = this.perform('attach', { seek, limit });

        console.log({ result });

        return result;
      },

      sendMessage({ type, message }) {
        this.perform({ type, message });
      }
    });

    return waitUntilConnected(this.channel);
  }

  play(atTime) {
    console.log(this.noteQueue);
    console.log({ clock: this.clock });

    this.player.createSynthFromNotes(this.noteQueue);

    waitUntilTime(atTime, () => this.player.start());
  }

  stop() {
    this.player.stop();
  }

  disconnect() {
    this.channel.unsubscribe();
  }
}
