/* eslint no-console:0 */

import Player from 'audio/player';
import MidiChannel from 'cables/midi';
import ConductorChannel from 'cables/conductor';

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Hack for testing
const instrumentImages = {
  "Flauti I II":          "chartreuse_flute.png",
  "Oboi I II":            "scarlet_oboe.png",
  "Clarinetti in B I II": "periwinkle_clarinet.png",
  "Fagotti I II":         "indigo_bassoon.png",
  "Corno I in F":         "red_trumpet.png",
  "Corno II in F":        "red_trumpet.png",
  "Violino I":            "vermilion_violin.png",
  "Violino II":           "vermilion_violin.png",
  "Viola":                "saffron_viola.png" ,
  "Violoncello":          "violet_cello.png",
  "Contrabasso":          "cerulean_bass.png",
};

const instrumentCommonNames = {
  "Flauti I II":          "Flute",
  "Oboi I II":            "Oboe 1 & 2",
  "Clarinetti in B I II": "Clarinet 1 & 2",
  "Fagotti I II":         "Bassoon 1 & 2",
  "Corno I in F":         "Horn 1",
  "Corno II in F":        "Horn 2",
  "Violino I":            "Violin 1",
  "Violino II":           "Violin 2",
  "Viola":                "Viola" ,
  "Violoncello":          "Cello",
  "Contrabasso":          "Double Bass",
};

function clockUpdater($timeElement, $offsetElement) {
  return function (clock) {
    if (!clock) return;

    $timeElement.innerText   = clock.now();
    $offsetElement.innerText = clock.offset;
  }
}

$(function () {
  const myUuid = uuid();

  let $btnConnect = document.querySelector('#connect');

  let $spanCurrentInstrumentName = document.querySelector('#current-instrument-name');
  let $spanCurrentlyConnected    = document.querySelector('#currently-connected');
  let $spanCurrentTime           = document.querySelector('#current-time');
  let $spanCurrentOffset         = document.querySelector('#current-offset');

  let $imgCurrentInstrument = document.querySelector('#current-instrument-image');

  const player = new Player();

  const midiChannel               = new MidiChannel(player);
  const directConductorChannel    = new ConductorChannel(midiChannel);
  const universalConductorChannel = new ConductorChannel(midiChannel);

  midiChannel.on('instrument', instrument => {
    $spanCurrentInstrumentName.innerText = instrumentCommonNames[instrument];
    $imgCurrentInstrument.src            = `img/${instrumentImages[instrument]}`;
  });

  const clockUpdate = clockUpdater($spanCurrentTime, $spanCurrentOffset);

  $btnConnect.addEventListener('click', () => {
    console.log('connecting')
    if (this.connecting || this.connected) return;
    this.connecting = true;

    const connected = Promise.all([
      directConductorChannel.connect({ uuid: myUuid }),
      universalConductorChannel.connect({ uuid: null, universal: true })
    ]);

    connected.then(() => {
      console.log('connected!')

      this.connecting = false;
      this.connected  = true;

      $spanCurrentlyConnected.innerText = 'CONNECTED';
      $spanCurrentlyConnected.style.color = 'green';

      setInterval(() => clockUpdate(midiChannel.clock), 1000);
    });
  });
});
