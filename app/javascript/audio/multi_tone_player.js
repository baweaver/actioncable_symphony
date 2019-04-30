import Tone from 'tone';

export default class MultiTonePlayer {
  constructor() {
    this.synths = [];
  }

  createSynth() {
    return new Tone.PolySynth(10, Tone.Synth, {
      envelope: {
        attack: 0.03,
        decay: 0.25,
        sustain: 0.3,
        release: 0.5
      }
    }).toMaster();
  }

  createSynthFromTracks(tracks, meta = {}) {
    let seek = 0;

    if (meta && meta.options && meta.options.seek) {
      seek = meta.options.seek || 0;
    }

    this.stop();

    Object.keys(tracks).forEach(trackName => {
      const synth = this.createSynth();
      synth.sync();

      tracks[trackName].forEach(({ name, duration, time, velocity }) => {
        synth.triggerAttackRelease(name, duration, time - seek, velocity);
      });

      this.synths.push(synth);
    });
  }

  start() {
    const transport = Tone.Transport;
    return transport.start();
  }

  stop(atTime) {
    if (!this.synths.length) return;

    this.synths.forEach(synth => synth.unsync());
    this.synths.forEach(synth => synth.disconnect());
    this.synths.forEach(synth => synth.dispose());

    Tone.Transport.cancel();
    Tone.Transport.stop();

    this.synths = [];
  }
}
