var recLength = 0,
  recBuffersL = [],
  recBuffersR = [],
  sampleRate;

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

function init(config){
  sampleRate = config.sampleRate;
}

function record(inputBuffer){
  recBuffersL.push(inputBuffer[0]);
  recBuffersR.push(inputBuffer[1]);
  recLength += inputBuffer[0].length;
}

function encodeOgg() {
  var state,
      data,
      blob;
  var buffers = [];
  importScripts('libvorbis.min.js');
  buffers.push( mergeBuffers(recBuffersL, recLength) );
  buffers.push( mergeBuffers(recBuffersR, recLength) );
  
  // fix!
  setTimeout(function() {
    state = Vorbis.init(sampleRate, 0.3);
    Vorbis.encode(state, buffers[0], buffers[1]);
    data = Vorbis.finish(state);

    blob = new Blob([data], {'type': 'audio/ogg'});
    this.postMessage(blob);
  }, 500);
}

function clear(){
  recLength = 0;
  recBuffersL = [];
  recBuffersR = [];
}

function mergeBuffers(recBuffers, recLength){
  var result = new Float32Array(recLength);
  var offset = 0;
  for (var i = 0; i < recBuffers.length; i++){
    result.set(recBuffers[i], offset);
    offset += recBuffers[i].length;
  }
  return result;
}
