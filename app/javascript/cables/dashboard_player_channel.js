// frontend/client/midi.js
// import createChannel from "cables/actioncable";

import cable from 'actioncable';
import MultiTonePlayer from 'audio/multi_tone_player';
import MidiChannel from 'cables/midi_channel';

import { waitUntilConnected, waitUntilTime } from 'util/async_tools';

export default class DashboardPlayerChannel {
  constructor({ uuid, clock }) {
    this.consumer    = cable.createConsumer();
    this.uuid        = uuid;
    this.clock       = clock;
    this.instrument  = 'all';

    this.noteQueue   = {};
    this.cachedNotes = {};

    this.tonePlayer  = new MultiTonePlayer();

    this.isConnecting = false;
    this.isConnected  = true;

    this.callbacks = {
      songStart:          [],
      songEnd:            [],
      firstNote:          [],
      play:               [],
      stop:               [],
      startSongBroadcast: [],
      stopSongBroadcast:  [],
      note:               []
    };
  }

  on(event, fn) {
    if (!this.callbacks[event]) return;

    this.callbacks[event].push(fn);
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

          klass.connectMidiChannel();
        });
      },

      disconnected(data) {
        klass.isConnected = false;
      },

      received({ type, message }) {
        switch (type) {
          case 'play':
            klass.callbacks.play.forEach(fn => fn(message));
            return klass.play(message);
          case 'stop':
            klass.callbacks.stop.forEach(fn => fn(message));
            return klass.stop();
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

  connectMidiChannel() {
    this.midiChannel = new MidiChannel({
      clock:      this.clock,
      instrument: this.instrument
    });

    this.midiChannel.on('startSongBroadcast', (meta) => {
      this.cachedNotes = {...this.noteQueue};
      this.noteQueue   = {};
      this.songMeta    = meta;
      this.streaming   = true;
      this.midiReady   = false;

      this.callbacks.startSongBroadcast.forEach(fn => fn());
    });

    this.midiChannel.on('note', message => {
      this.noteQueue[message.track] = this.noteQueue[message.track] || [];
      this.noteQueue[message.track].push(message)

      this.callbacks.note.forEach(fn => fn());
    });

    this.midiChannel.on('stopSongBroadcast', () => {
      this.streaming = false;
      this.midiReady = true;

      this.callbacks.firstNote.forEach(fn => fn(this.noteQueue[0]));

      this.loadSynth();

      this.channel.updateMeta({ ready: true });

      this.callbacks.stopSongBroadcast.forEach(fn => fn());
    });

    this.midiChannel.connect().then(() => {
      this.channel.updateMeta({ instrument: 'all' });
    });
  }

  loadSynth() {
    if (!Object.keys(this.noteQueue).length) {
      this.noteQueue   = { ...this.cachedNotes };
      this.cachedNotes = {};
    }

    this.tonePlayer.createSynthFromTracks(this.noteQueue, this.songMeta);
  }

  play(atTime) {
    const currentTime = this.clock.now();

    this.callbacks.songStart.forEach(fn => fn(atTime));

    // New method, works on the transport sync for better accuracy
    this.tonePlayer.start(`+${1 + atTime - currentTime}`);

    // Old method, introduces some artificial lag
    // waitUntilTime(atTime, this.clock, () => this.tonePlayer.start());
  }

  stop() {
    this.cachedNotes = {...this.noteQueue};
    this.noteQueue   = {};

    this.tonePlayer.stop();
  }

  disconnect() {
    this.channel.unsubscribe();
  }
}
