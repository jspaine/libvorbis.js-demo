function __log(e, data) {
    log.innerHTML += "\n" + e + " " + (data || '');
}

var audio_context;
var recorder;

function startUserMedia(stream) {
  var input = audio_context.createMediaStreamSource(stream);
  __log('Media stream created.');

  input.connect(audio_context.destination);
  __log('Input connected to audio context destination.');

  recorder = new Recorder(input, {
      workerPath: 'scripts/recorderWorker.js'
  });
  __log('Recorder initialised.');
}

function startRecording(button) {
  recorder && recorder.record();
  button.disabled = true;
  button.nextElementSibling.disabled = false;
  __log('Recording...');
}

function stopRecording(button) {
  recorder && recorder.stop();
  button.disabled = true;
  button.previousElementSibling.disabled = false;
  __log('Stopped recording.');
  
  oggTest();
  recorder.clear();
}

function oggTest() {
  var state,
      data,
      ogg_blob,
      url,li,au,hf;

  state = Vorbis.init(44100, 0.3);
  
  recorder && recorder.getBuffer(function(buffers) {
    Vorbis.encode(state, buffers[0], buffers[1]);
    data = Vorbis.finish(state);
    console.log(data);
    ogg_blob = new Blob([data], {'type': 'audio/ogg'});

    url = URL.createObjectURL(ogg_blob);
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
  });
}

function createDownloadLink() {
  recorder && recorder.exportWAV(function(blob) {
    var url = URL.createObjectURL(blob);
    var li = document.createElement('li');
    var au = document.createElement('audio');
    var hf = document.createElement('a');

    au.controls = true;
    au.src = url;
    hf.href = url;
    hf.download = new Date().toISOString() + '.wav';
    hf.innerHTML = hf.download;
    li.appendChild(au);
    li.appendChild(hf);
    recordingslist.appendChild(li);
  });
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

    audio_context = new AudioContext;
    __log('Audio context set up.');
    __log('navigator.getUserMedia ' + (navigator.getUserMedia ? 'available.' : 'not present!'));
  } catch (e) {
    alert('No web audio support in this browser!');
  }

  navigator.getUserMedia({audio: true}, startUserMedia, function(e) {
    __log('No live audio input: ' + e);
  });
};