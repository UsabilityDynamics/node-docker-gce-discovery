var gce = require('./gce');
var Dockerode = require('dockerode');
var async = require('async');
var _ = require('lodash');
var debug = require('debug');

module.exports.getDockerContainers = function getDockerContainers( options, done ) {

  async.auto({
    get_machines: [function(callback){
      gce.getInstances(options, function getMachines(error, machines){
        var arrayInstances = _.filter(machines, {status: 'RUNNING', tags: {items: options.machineTags}});
        callback(error, arrayInstances);
      });

    }],
    get_obj_machine: ['get_machines', function(results, callback){
      var data = [];
      async.each(results.get_machines, function(value, callback_each){
        var machineBody = new Dockerode({
          host: (options.externalIP ? _.get(value, 'networkInterfaces[0].accessConfigs[0].natIP') : _.get(value, 'networkInterfaces[0].networkIP')),
          port: options.dockerPort
        });
        var machineObj = {};
        machineObj[value.name] = machineBody;
        data.push(machineObj);
        
        callback_each();
        
      }, function(error){
        
        callback(error, data);
        
      });
    }],
    get_containers: ['get_obj_machine', function(results, callback){

      var instances = {
        containers: [],
        machines: [],
      };

      async.each(results.get_obj_machine, function(value, callback_each1){
        _.each(value, function(value_inside, key_inside){
          instances.machines.push({
            name: key_inside,
            host: value_inside.modem.host,
            port: value_inside.modem.port
          });
          var _containers = [];
          var i = 0;
          var length = 0;
          value_inside.listContainers(function (error, containers) {

            if(error){
              return callback_each1( error );
            }

            _containers = containers;
            length = _containers.length;

          _.each(_containers, function(_container){
            i++;
            _container.machine_name = key_inside;
            _container.host = value_inside.modem.host;
            _container.port = value_inside.modem.port;
            instances.containers.push(_container);
          });

          if(i == length){
            callback_each1();
          }

          });
        });
      }, function(error){

        callback(error, instances);
      });

    }]
  }, function(error, result){
    if(!error){
      debug('getDockerContainers.js getting ' + result.get_containers.machines.length + ' machines and ' + result.get_containers.containers.length + ' containers.');
      done(null, result.get_containers);
    } else {
      done(error);
    }

  });

};







