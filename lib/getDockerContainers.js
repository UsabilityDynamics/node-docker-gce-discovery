var gce = require('./gce');
var Dockerode = require('dockerode');
var async = require('async');
var _ = require('lodash');

module.exports.getDockerContainers = function getDockerContainers( options, done ) {

  //console.log('getDockerContainers.js', require('util').inspect(options, {showHidden: false, depth: 10, colors: true}));

  async.auto({
    get_machines: [function(callback){
      //console.log('getDockerContainers.js', require('util').inspect('get_machines', {showHidden: false, depth: 10, colors: true}));
      gce.getInstances(options, function getMachines(error, machines){
        //console.log(require('util').inspect(machines, {showHidden: false, depth: 10, colors: true}));
        var arrayInstances = _.filter(machines, {status: 'RUNNING', tags: {items: options.machineTags}});
        //console.log(require('util').inspect(arrayInstances, {showHidden: false, depth: 10, colors: true}));
        callback(null, arrayInstances);
      });

    }],
    get_obj_machine: ['get_machines', function(results, callback){
      //console.log('getDockerContainers.js', require('util').inspect('get_obj_machine', {showHidden: false, depth: 10, colors: true}));
      var data = [];
      async.each(results.get_machines, function(value, callback_each){
        // var port = '';
        // _.each(value.metadata.items, function(value_port){
        //   if(value_port.key == 'docker-port'){
        //     port = value_port.value;
        //   }
        // });
        var machineBody = new Dockerode({
          //host: _.get(value, 'networkInterfaces[0].accessConfigs[0].natIP'),
          host: _.get(value, 'networkInterfaces[0].networkIP'),
          port: options.dockerPort
        });
        var machineObj = {};
        machineObj[value.name] = machineBody;
        data.push(machineObj);
        
        callback_each();
        
      }, function(error){
        
        callback(null, data);
        
      });
    }],
    get_containers: ['get_obj_machine', function(results, callback){

      //console.log('get_obj_machine', require('util').inspect(results.get_obj_machine, {showHidden: false, depth: 10, colors: true}));
      //console.log('getDockerContainers.js', require('util').inspect('get_containers', {showHidden: false, depth: 10, colors: true}));
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

            // var obj = {};
            //     obj[key_inside] = {
            //       host: value_inside.modem.host,
            //       port: value_inside.modem.port,
            //       containers: containers
            //     };
            // container.push(obj);

          });
        });
      }, function(error){
        //console.log('length2', require('util').inspect(instances.containers.length, {showHidden: false, depth: 10, colors: true}));
        callback(null, instances);
      });

    }]
  }, function(error, result){
    //console.log('result', require('util').inspect(result.get_containers, {showHidden: false, depth: 10, colors: true}));
    //console.log('getDockerContainers.js', require('util').inspect('done function', {showHidden: false, depth: 10, colors: true}));
    done(null, result.get_containers);
  });

};







