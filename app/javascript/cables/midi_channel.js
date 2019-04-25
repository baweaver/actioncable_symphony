import cable from 'actioncable';

import { waitUntilConnected, waitUntilTime } from 'util/async_tools';

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export default class MidiChannel {
  constructor({ instrument }) {
    this.consumer   = cable.createConsumer();
    this.instrument = instrument;
    this.callbacks  = {
      startSongBroadcast: [],
      note:               [],
      stopSongBroadcast:  []
    };
  }

  on(event, fn) {
    console.log('on:', event)
    if (!this.callbacks[event]) return;

    this.callbacks[event].push(fn);
  }


  connect() {
    const klass = this;

    this.channel = this.consumer.subscriptions.create({
      channel:    "MidiChannel",
      instrument: this.instrument
    }, {
      connected(data) {
        return waitUntilConnected(this);
      },

      disconnected(data) {
        // console.log('Disconnected from Midi Channel', data);
      },

      received({ type, message }) {
        if (!klass.callbacks[type]) return;

        klass.callbacks[type].forEach(fn => fn(message));
      },

      sendMessage({ type, message }) {
        this.perform({ type, message });
      }
    });

    return waitUntilConnected(this.channel);
  }

  disconnect() {
    this.channel.unsubscribe();
  }
}
