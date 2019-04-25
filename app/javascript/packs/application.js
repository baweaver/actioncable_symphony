/* eslint no-console:0 */
// This file is automatically compiled by Webpack, along with any other files
// present in this directory. You're encouraged to place your actual application logic in
// a relevant structure within app/javascript and only use these pack files to reference
// that code so it'll be compiled.
//
// To reference this file, add <%= javascript_pack_tag 'application' %> to the appropriate
// layout file, like app/views/layouts/application.html.erb

// Style
// import '@blueprintjs/icons/lib/css/blueprint-icons.css';
// import '@blueprintjs/core/lib/css/blueprint.css';
import 'styles/application.sass';

import ConductorChannel from 'cables/conductor_channel';


$(function () {
  let $universalAssign = document.querySelector('#universalAssign');
  let $universalBuffer = document.querySelector('#universalBuffer');
  let $universalPlay   = document.querySelector('#universalPlay');
  let $universalStop   = document.querySelector('#universalStop');

  if (!$universalAssign || !$universalPlay) return;

  const conductorChannel = new ConductorChannel();
  conductorChannel.connect();

  $universalAssign.addEventListener('click', () => {
    conductorChannel.channel.assignInstruments();
  });

  $universalBuffer.addEventListener('click', () => {
    conductorChannel.channel.bufferMusic();
  });

  $universalPlay.addEventListener('click', () => {
    conductorChannel.channel.play();
  });

  $universalStop.addEventListener('click', () => {
    conductorChannel.channel.stop();
  });
});
