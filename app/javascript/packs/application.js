/* eslint no-console:0 */
// This file is automatically compiled by Webpack, along with any other files
// present in this directory. You're encouraged to place your actual application logic in
// a relevant structure within app/javascript and only use these pack files to reference
// that code so it'll be compiled.
//
// To reference this file, add <%= javascript_pack_tag 'application' %> to the appropriate
// layout file, like app/views/layouts/application.html.erb

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

$(function () {
  console.log('IN')

  // const myUuid = uuid();

  // let $play = document.querySelector('#play');
  // let $stop = document.querySelector('#stop');

  // let $requestInstrument = document.querySelector('#instrument');
  // let $conductorAssign = document.querySelector('#conductorAssign');
  // let $instrumentSelect = document.querySelector('#instruments');
  let $universalAssign = document.querySelector('#universalAssign');
  let $universalPlay = document.querySelector('#universalPlay');
  let $universalStop = document.querySelector('#universalStop');

  if (!$universalAssign || !$universalPlay) return;

  const player = new Player();

  const midiChannel = new MidiChannel(player);
  // const directConductorChannel = new ConductorChannel(midiChannel);
  const universalConductorChannel = new ConductorChannel(midiChannel);

  // directConductorChannel.connect({ uuid: myUuid });
  universalConductorChannel.connect({ uuid: null, universal: true });

  // For whatever reason `this` doesn't bind properly unless it's given
  // through an arrow function like this.
  // $play.addEventListener('click', () => player.playSong());
  // $play.addEventListener('click', () => midiChannel.play());
  // $stop.addEventListener('click', () => player.stop());

  // $conductorAssign.addEventListener('click', () => {
  //   directConductorChannel.assignInstrument();
  // });

  $universalAssign.addEventListener('click', () => {
    console.log('ok ok')
    universalConductorChannel.channel.universalAssignments();
  });

  $universalPlay.addEventListener('click', () => {
    universalConductorChannel.channel.universalPlay();
  });

  $universalStop.addEventListener('click', () => {
    universalConductorChannel.channel.universalStop();
  });

  // $requestInstrument.addEventListener('click', () => {
  //   const type = $instrumentSelect.options[$instrumentSelect.selectedIndex].value;
  //   const seek = instrumentSeeks[type];

  //   console.log({ type, seek });

  //   midiChannel.attachToInstrument({ type, seek /*, limit: 30 */ });
  // })
});
