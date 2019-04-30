// frontend/client/midi.js
// import createChannel from "cables/actioncable";

import cable from 'actioncable';
import { waitUntilConnected } from 'util/async_tools';

export default class ConductorChannel {
  constructor() {
    this.consumer       = cable.createConsumer();
    this.allAssignments = {};
    this.clientMeta     = {};
    this.callbacks      = {
      assignment: [],
      play:       [],
      stop:       [],
      buffering:  [],
      counts:     [],
      meta:       []
    };
  }

  on(event, fn) {
    if (!this.callbacks[event]) return;

    this.callbacks[event].push(fn);
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
      },

      received({ type, message }) {
        switch (type) {
          case 'allAssignments':
            klass.callbacks.assignment.forEach(fn => fn(message));
            return klass.allAssignments = message;
          case 'trackNames':
            return klass.trackNames = message;
          case 'clientCounts':
            klass.callbacks.counts.forEach(fn => fn(message));
            return klass.clientCounts = message;
          case 'clientMeta':
            klass.clientMeta[message.uuid] = message;
            return klass.callbacks.meta.forEach(fn => fn(Object.values(klass.clientMeta)));
        }
      },

      getTrackNames() {
        this.perform('track_names');
      },

      assignInstruments({ song, options }) {
        this.perform('assign_instruments', { song, options });
      },

      play({ song, options }) {
        this.perform('play', { song, options });
      },

      stop() {
        this.perform('stop');
      },

      bufferMusic({ song, options }) {
        klass.callbacks.buffering.forEach(fn => fn());

        // Hard-coding for now
        // this.perform('buffer_music', { upTo: 61.5 });
        this.perform('buffer_music', { song, options });
      }
    });

    return waitUntilConnected(this.channel);
  }

  disconnect() {
    this.channel.unsubscribe();
  }
}
