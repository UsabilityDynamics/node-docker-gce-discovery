var async = require('async');
var _ = require('lodash');
var getDockerContainers = require('./lib/getDockerContainers');
var Dockerode = require('dockerode');
var DockerEvents = require('docker-events');
var debug = require('debug');

module.exports.create = function containersList( options ) {
  
  var _state = {
    containers: [],
    machines: []
  };
  
  options = _.defaults(options, {
    gceConfig: {}, //path to service account JSON file or the object itself || string
    zones: [],
    project: null,
    externalIP: false,
    machineTags: [], // required tags a GCE machine must have to be monitored || array
    dockerPort: 2375, // which port on the found machines to use to connect || number
    watch: true // if enabled watch Docker Daemon for changes || bool
  });

  async.auto({
    get_machines_data: [function (callback) {
      debug('inside get_machines_data');
      getDockerContainers.getDockerContainers(options, function getContainers(error, machines_data) {
        debug('inside index - getDockerContainers');
          callback(error, machines_data);
      });

    }],
    instances_list: ['get_machines_data', function (results, callback) {

      _state.machines = results.get_machines_data.machines;
      var instances = {};

      debug('inside instances_list');

      async.each(results.get_machines_data.machines, function (value_each, callback_each) {

          instances[value_each.name] = new DockerEvents({
            docker: new Dockerode({
              host: value_each.host,
              port: parseInt(value_each.port)
            }),
          });
          callback_each();

      }, function (error) {
        callback(error, instances);
      });

    }],
  }, function (error, result) {

    if(error){
      debug(error);
      _state.error = error;
      return;
    }

    _.each(result.get_machines_data.containers, function(item2){
      _state.containers.push(item2);
    });

    if(options.watch){
      _.each(result.instances_list, function (value, key) {

        value.start();
        
        value.on("connect", function () {
          debug("connected to docker api machine [" + key + "] " + new Date());
        });

        value.on("disconnect", function () {
          debug("disconnected to docker api machine [" + key + "] " + new Date());
        });

        value.on("create", function (message) {
          debug("container created on [" + key + "] machine: %j " + new Date(), message);
          getDockerContainers.getDockerContainers(options, function getContainers(options, machines_data) {
            _state.containers = [];
            _.each(machines_data.containers, function(item){
              _state.containers.push(item);
            });
          });
        });

        value.on("start", function (message) {
          debug("container started on [" + key + "] machine: %j " + new Date(), message);
          getDockerContainers.getDockerContainers(options, function getContainers(options, machines_data) {
            _state.containers = [];
            _.each(machines_data.containers, function(item){
              _state.containers.push(item);
            });
          });
        });

        value.on("stop", function (message) {
          if(_state.containers) {
            debug("container stopped on [" + key + "] machine: %j " + new Date(), message);
            _.each(_state.containers, function (container, number_container) {
              if (container.Id == message.id) {
                _state.containers.splice(number_container, 1);
              }
            });
          } else {
            debug("stop event: container object is empty: %j " + new Date(), message);
          }
        });

        value.on("destroy", function (message) {
          if(_state.containers){
            debug("container destroyed on [" + key + "] machine: %j " + new Date(), message);
            _.each(_state.containers, function(container, number_container){
              if (container.Id == message.id) {
                _state.containers.splice(number_container, 1);
              }
            });
          } else {
            debug("destroy event: container object is emty: %j " + new Date(), message);
          }
        });
        value.stop();
      });
    }
  });
  
  return _state;
}


