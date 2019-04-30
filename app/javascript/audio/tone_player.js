import Tone from 'tone';

export default class TonePlayer {
  constructor() {
    // this.synth = this.createSynth();
  }

  playNote({name, duration, time, velocity}) {
    this.synth.triggerAttackRelease(name, duration, time, velocity);
  }

  createSynth() {
    return new Tone.Synth({
      envelope: {
        attack: 0.03,
        decay: 0.25,
        sustain: 0.3,
        release: 0.5
      }
    }).toMaster();
  }

  createSynthFromNotes(notes, meta) {
    let seek = 0;

    if (meta && meta.options && meta.options.seek) {
      seek = meta.options.seek || 0;
    }

    this.stop();
    this.synth = this.createSynth();
    this.synth.sync();

    notes.forEach(({ name, duration, time, velocity }) => {
      this.synth.triggerAttackRelease(name, duration, time - seek, velocity);
    });
  }

  start() {
    return Tone.Transport.start();
  }

  stop(atTime) {
    if (!this.synth) return;

    this.synth.unsync();
    this.synth.disconnect();
    this.synth.dispose();

    Tone.Transport.cancel();
    Tone.Transport.stop();

    this.synth = this.createSynth();
  }
}
