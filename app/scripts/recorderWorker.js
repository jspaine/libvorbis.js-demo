'use strict';

var recLength = 0,
  recBuffersL = [],
  recBuffersR = [],
  sampleRate,
  encoderReady = false;

function mergeBuffers(recBuffers, recLength){
  var result = new Float32Array(recLength);
  var offset = 0;
  for (var i = 0; i < recBuffers.length; i++){
    result.set(recBuffers[i], offset);
    offset += recBuffers[i].length;
  }
  return result;
}

function init(config){
  sampleRate = config.sampleRate;
}

function record(inputBuffer){
  recBuffersL.push(inputBuffer[0]);
  recBuffersR.push(inputBuffer[1]);
  recLength += inputBuffer[0].length;
}

function vorbisReady() {
  encoderReady = true;
}

function encodeOgg() {
  var state,
      data,
      blob;
  var buffers = [];
  buffers.push( mergeBuffers(recBuffersL, recLength) );
  buffers.push( mergeBuffers(recBuffersR, recLength) );
  encoderReady = false;
  importScripts('libvorbis.min.js');
  
  setInterval(function() {
    if (!encoderReady) {
      return;
    }
    state = Vorbis.init(sampleRate, 0.3);
    Vorbis.encode(state, buffers[0], buffers[1]);
    data = Vorbis.finish(state);
    encoderReady = false;
    blob = new Blob([data], {'type': 'audio/ogg'});
    this.postMessage(blob);
  }, 10);
}

function clear(){
  recLength = 0;
  recBuffersL = [];
  recBuffersR = [];
}

this.onmessage = function(e){
  switch(e.data.command){
    case 'init':
      init(e.data.config);
      break;
    case 'record':
      record(e.data.buffer);
      break;
    case 'encodeOgg':
      encodeOgg();
      break;
    case 'clear':
      clear();
      break;
  }
};