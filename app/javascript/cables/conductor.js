// frontend/client/midi.js
// import createChannel from "cables/actioncable";

import cable from 'actioncable';
import { waitUntilConnected } from 'util/async_tools';

// Hack for testing
const instrumentSeeks = {
  "Flauti I II": 38,
  "Oboi I II": 30,
  "Clarinetti in B I II": 30,
  "Fagotti I II": 20,
  "Corno I in F": 13,
  "Corno II in F": 13,
  "Violino I": 0,
  "Violino II": 0,
  "Viola": 0 ,
  "Violoncello": 0,
  "Contrabasso": 10,
};

export default class ConductorChannel {
  constructor(midiChannel) {
    console.log('Creating')
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
              klass.midiChannel.attachToInstrument({ seek: 0, upTo: 45 /*, limit: 45*/ });
            });
          case 'all_assignments':
            if (!universal) return false;

            console.log({ allAssignments: message });
            klass.allAssignments = message;
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
