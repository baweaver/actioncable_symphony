// frontend/client/midi.js
// import createChannel from "cables/actioncable";

import cable from 'actioncable';
import { waitUntilConnected } from 'util/async_tools';

export default class ConductorChannel {
  constructor() {
    this.consumer       = cable.createConsumer();
    this.allAssignments = {};
  }

  connect() {
    const klass = this;

    this.channel = this.consumer.subscriptions.create({
      channel: "ConductorChannel"
    }, {
      connected(data) {
        return waitUntilConnected(klass.channel);
      },

      disconnected(data) {
        // console.log('disconnected', data);
      },

      received({ type, message }) {
        switch (type) {
          case 'allAssignments':
            return klass.allAssignments = message;
        }
      },

      assignInstruments() {
        this.perform('assign_instruments', {
          // Nothing for now, add dynamics in later
        });
      },

      play() {
        this.perform('play');
      },

      stop() {
        this.perform('stop');
      },

      bufferMusic() {
        // Hard-coding for now
        this.perform('buffer_music', { upTo: 61.5 });
      }
    });

    return waitUntilConnected(this.channel);
  }

  disconnect() {
    this.channel.unsubscribe();
  }
}
