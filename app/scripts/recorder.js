(function(window){

  var WORKER_PATH = 'recorderWorker.js';

  var Recorder = function(source, cfg){
    var config = cfg || {};
    var bufferLen = config.bufferLen || 8192;
    this.context = source.context;
    this.node = (this.context.createScriptProcessor ||
                 this.context.createJavaScriptNode).call(this.context,
                                                         bufferLen, 2, 2);
    var worker = new Worker(config.workerPath || WORKER_PATH);
  
    worker.postMessage({
      command: 'init',
      config: {
        sampleRate: this.context.sampleRate
      }
    });
    var recording = false,
      currCallback;
    
    var self = this;
    this.node.onaudioprocess = function(e){
      if (!recording) return;
      self.ondata && self.ondata(e.inputBuffer.getChannelData(0));
      worker.postMessage({
        command: 'record',
        buffer: [
          e.inputBuffer.getChannelData(0),
          e.inputBuffer.getChannelData(1)
        ]
      });
    };

    this.configure = function(cfg){
      for (var prop in cfg){
        if (cfg.hasOwnProperty(prop)){
          config[prop] = cfg[prop];
        }
      }
    };

    this.record = function(){
      recording = true;
    };

    this.stop = function(){
      recording = false;
    };

    this.clear = function(){
      worker.postMessage({ command: 'clear' });
    };

    this.encodeOgg = function(cb){
      currCallback = cb || config.callback;
      if (!currCallback) throw new Error('Callback not set');
      worker.postMessage({
        command: 'encodeOgg'
      });
    };

    this.shutdown = function(){
      worker.terminate();
      source.disconnect();
      this.node.disconnect();
    };

    worker.onmessage = function(e){
      var blob = e.data;
      currCallback(blob);
    };

    source.connect(this.node);
    this.node.connect(this.context.destination);    //this should not be necessary
  };

  window.Recorder = Recorder;

})(window);
