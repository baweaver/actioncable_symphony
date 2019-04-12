import Tone from 'tone';

const DEBUG = true;

function debugLog(str) {
  if (!DEBUG) return;
  console.log(str);
}

export default class Player {
  constructor() {
    this.synths = [];
    this.soloSynth = null;
  }

  playSong(song, until, track) {
    this.loadSong(song, until, track).then(this.start);
  }

  playNote({name, duration, time, velocity}, currentOffset) {
    this.soloSynth = this.soloSynth || this.createSynth();
    currentOffset  = currentOffset || 0;

    this.soloSynth.triggerAttackRelease(name, duration, time, velocity);
  }

  loadSong(song, until, track) {
    song  = song  || 'beethoven_6th_midi';
    until = until || 60;

    return $.get('ze_song', { song, until }).then(song => {
      debugLog(`Start Loading @ ${Tone.now()}`);

      song.tracks.forEach(track => {
        debugLog(`  Loading ${track.name} @ ${Tone.now()}`);
        this.createSynthFromTrack(track);
        debugLog(`    ${track.name} Loaded @ ${Tone.now()}`);
      });

      debugLog(`Done Loading @ ${Tone.now()}`);
    });
  }

  createSynth() {
    return new Tone.PolySynth(10, Tone.Synth, {
      envelope: {
        attack: 0.02,
        decay: 0.1,
        sustain: 0.3,
        release: 1
      }
    }).toMaster();
  }

  createSynthFromTrack(track) {
    const synth = this.createSynth();
    this.synths.push(synth);

    synth.sync();

    track.notes.forEach(({ name, duration, time, velocity }) => {
      synth.triggerAttackRelease(name, duration, time, velocity);
    });
  }

  createSynthFromNotes(notes) {
    const synth = this.createSynth();
    synth.sync();

    notes.forEach(({ name, duration, time, velocity }) => {
      synth.triggerAttackRelease(name, duration, time, velocity);
    });
  }

  start() {
    return Tone.Transport.start();
  }

  stop() {
    Tone.Transport.cancel();
    Tone.Transport.stop();
    this.synths.forEach(synth => synth.releaseAll());
    if (this.soloSynth) this.soloSynth.releaseAll();
  }
}
