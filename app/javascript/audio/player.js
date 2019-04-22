import Tone from 'tone';

const DEBUG = true;

function debugLog(str) {
  if (!DEBUG) return;
  console.log(str);
}

export default class Player {
  constructor() {
    this.synth = this.createSynth();
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

  createSynthFromNotes(notes) {
    this.synth.sync();

    notes.forEach(({ name, duration, time, velocity }) => {
      this.synth.triggerAttackRelease(name, duration, time, velocity);
    });
  }

  start() {
    return Tone.Transport.start();
  }

  stop(atTime) {
    this.synth.unsync();
    this.synth.dispose();

    Tone.Transport.cancel();
    Tone.Transport.stop();

    this.synth = this.createSynth();
  }
}
