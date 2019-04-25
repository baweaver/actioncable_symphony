// frontend/client/midi.js
// import createChannel from "cables/actioncable";

import cable from 'actioncable';
import TonePlayer from 'audio/tone_player';
import MidiChannel from 'cables/midi_channel';

import { waitUntilConnected, waitUntilTime } from 'util/async_tools';

export default class PlayerChannel {
  constructor({ uuid, clock, onInstrument }) {
    this.consumer    = cable.createConsumer();
    this.uuid        = uuid;
    this.clock       = clock;
    this.noteQueue   = [];
    this.cachedNotes = [];
    this.tonePlayer  = new TonePlayer();

    this.isConnecting = false;
    this.isConnected  = true;

    this.onInstrument = onInstrument;
  }

  connect() {
    const klass = this;

    this.clock.start();
    this.isConnecting = true;

    this.clock.on('change', () => {
      this.channel.updateMeta({ latency: this.clock.offset })
    });

    this.channel = this.consumer.subscriptions.create({
      channel: "PlayerChannel",
      uuid:    this.uuid
    }, {
      connected(data) {
        return waitUntilConnected(this).then(() => {
          klass.isConnecting = false;
          klass.isConnected  = true;
        });
      },

      disconnected(data) {
        klass.isConnected = false;
      },

      received({ type, message }) {
        switch (type) {
          case 'play':
            return klass.play(message.time);
          case 'stop':
            return klass.stop();
          case 'instrumentAssignment':
            return klass.connectMidiChannel(message);
        }
      },

      updateMeta(message) {
        this.perform('update_meta', message);
      },

      sendMessage({ type, message }) {
        this.perform({ type, message });
      }
    });

    return waitUntilConnected(this.channel);
  }

  connectMidiChannel(instrument) {
    this.instrument  = instrument;

    this.midiChannel = new MidiChannel({
      clock: this.clock,
      instrument: instrument
    });

    this.midiChannel.on('startSongBroadcast', () => {
      this.cachedNotes = [...this.noteQueue];
      this.noteQueue   = [];
      this.streaming   = true;
      this.midiReady   = false;
    });

    this.midiChannel.on('note', message => {
      this.noteQueue.push(message);
    });

    this.midiChannel.on('stopSongBroadcast', () => {
      this.streaming = false;
      this.midiReady = true;
    });

    this.midiChannel.connect().then(() => {
      this.channel.updateMeta({
        instrument,
        ready: true,
        latency: this.clock.offset
      });
      this.onInstrument(instrument);
    });
  }

  play(atTime) {
    if (!this.noteQueue.length) {
      this.noteQueue   = [...this.cachedNotes];
      this.cachedNotes = [];
    }

    this.tonePlayer.createSynthFromNotes(this.noteQueue, this.clock, atTime);

    waitUntilTime(atTime, this.clock, () => this.tonePlayer.start());
  }

  stop() {
    this.cachedNotes = [...this.noteQueue];
    this.noteQueue   = [];

    this.tonePlayer.stop();
  }

  disconnect() {
    this.channel.unsubscribe();
  }
}
