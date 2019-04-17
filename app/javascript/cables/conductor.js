// frontend/client/midi.js
// import createChannel from "cables/actioncable";

import cable from 'actioncable';
import { waitUntilConnected } from 'util/async_tools';

export default class ConductorChannel {
  constructor(midiChannel) {
    this.consumer = cable.createConsumer();
    this.midiChannel = midiChannel;
  }

  assignInstrument() {
    return this.channel.attach();
  }

  connect({ uuid, universal }) {
    console.log('connecting...');

    const klass = this;

    this.channel = this.consumer.subscriptions.create({
      channel: "ConductorChannel", uuid, universal
    }, {
      connected(data) {
        console.log('connected', data);

        return waitUntilConnected(klass.channel);
      },

      disconnected(data) {
        console.log('disconnected', data);
      },

      received({ type, message }) {
        console.log('received', { type, message });

        switch (type) {
          case 'assignment':
            if (universal) return false;

            // Bind to instrument
            return klass.midiChannel.connect({ type: message }).then(() => {
              klass.midiChannel.attachToInstrument({ seek: 0, upTo: 60 /*, limit: 45*/ });
            });
          case 'all_assignments':
            if (!universal) return false;

            console.log({ allAssignments: message });
            return klass.allAssignments = message;
          case 'stop':
            return klass.midiChannel.stop();
          case 'play':
            return klass.midiChannel.play(message);
        }
      },

      universalAssignments() {
        console.log('oh?')
        // if (!universal) return false;

        this.perform('universal_assignments')
      },

      universalPlay() {
        if (!universal) return false;

        this.perform('universal_play')
      },

      universalStop() {
        if (!universal) return false;

        this.perform('universal_stop')
      },

      play() {

      },

      attach() {
        return this.perform('attach');
      },
    });

    return waitUntilConnected(this.channel);
  }

  disconnect() {
    this.channel.unsubscribe();
  }
}
