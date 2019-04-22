// frontend/client/midi.js
// import createChannel from "cables/actioncable";

import cable from 'actioncable';
import Player from 'audio/player';

import { waitUntilConnected, waitUntilTime } from 'util/async_tools';

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export default class MidiChannel {
  constructor(clock) {
    this.consumer  = cable.createConsumer();
    this.noteQueue = [];
    this.player    = new Player();
    this.callbacks = [];
    this.clock     = clock;
  }

  on(event, fn) {
    this.callbacks[`on${capitalize(event)}`] = fn;
  }

  attachToInstrument({ seek, limit, upTo }) {
    console.log('attaching')
    this.noteQueue = [];
    this.channel.attach({ seek, limit, upTo });

    if (this.callbacks.onInstrument) {
      this.callbacks.onInstrument(this.instrument);
    }
  }

  connect({ type }) {
    console.log('connecting...');

    const klass = this;

    this.instrument = type;

    this.clock.start();

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
          case 'note':
            return klass.noteQueue.push(message);
          case 'attach':
            return this.attach(message);
        }
      },

      attach({ seek, limit, upTo }) {
        klass.seek = seek || 0;

        console.log({
          attachment: true, type: klass.instrument, seek, limit, upTo
        });

        const result = this.perform('attach', { seek, limit, upTo });

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

    if (!this.noteQueue.length) {
      this.noteQueue   = [...this.cachedNotes];
      this.cachedNotes = [];
    }

    this.player.createSynthFromNotes(this.noteQueue, this.clock);

    waitUntilTime(atTime, this.clock, () => this.player.start());
  }

  stop() {
    this.cachedNotes = [...this.noteQueue];
    this.noteQueue   = [];

    this.player.stop();
  }

  disconnect() {
    this.channel.unsubscribe();
  }
}
