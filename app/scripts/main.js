'use strict';

function __log(e, data) {
  log.innerHTML += '\n' + e + ' ' + (data || '');
}

var audioContext;
var recorder;

function startUserMedia(stream) {
  var input = audioContext.createMediaStreamSource(stream);
  __log('Media stream created.');

  input.connect(audioContext.destination);
  __log('Input connected to audio context destination.');

  recorder = new Recorder(input, {
    workerPath: 'scripts/recorderWorker.js'
  });
  __log('Recorder initialised.');
}

function appendRecording(url) {
  var li,au,hf;

  li = document.createElement('li');
  au = document.createElement('audio');
  hf = document.createElement('a');

  au.controls = true;
  au.src = url;
  hf.href = url;
  hf.download = new Date().toISOString() + '.ogg';
  hf.innerHTML = hf.download;
  li.appendChild(au);
  li.appendChild(hf);
  recordingslist.appendChild(li);
}

function startRecording(button) {
  recorder && recorder.record();
  button.disabled = true;
  button.nextElementSibling.disabled = false;
  __log('Recording...');
}

function stopRecording(button) {
  recorder && recorder.stop();
  recorder && recorder.encodeOgg(function(blob) {
    appendRecording(URL.createObjectURL(blob));
  });
  recorder.clear();
  button.disabled = true;
  button.previousElementSibling.disabled = false;
  __log('Stopped recording.');

}

window.onload = function init() {
  try {
    // webkit shim
    window.AudioContext = window.AudioContext ||
                    window.webkitAudioContext ||
                    window.mozAudioContext;
    navigator.getUserMedia = navigator.getUserMedia ||
                    navigator.webkitGetUserMedia ||
                    navigator.mozGetUserMedia;
    window.URL = window.URL || window.webkitURL;

    audioContext = new AudioContext();
    __log('Audio context set up.');
    __log('navigator.getUserMedia ' + (navigator.getUserMedia ? 'available.' : 'not present!'));
  } catch (e) {
    alert('No web audio support in this browser!');
  }

  navigator.getUserMedia({audio: true}, startUserMedia, function(e) {
    __log('No live audio input: ' + e);
  });
};