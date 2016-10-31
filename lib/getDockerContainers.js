var gce = require('./gce');
var Dockerode = require('dockerode');
var async = require('async');
var _ = require('lodash');

module.exports.getDockerContainers = function getDockerContainers( options, done ) {

  async.auto({
    get_machines: [function(callback){

      gce.getInstances(null, function getMachines(error, machines){
        //console.log(require('util').inspect(machines, {showHidden: false, depth: 10, colors: true}));
        var arrayInstances = _.filter(machines, {status: 'RUNNING', tags: {items: ['docker-server']}});
        //console.log(require('util').inspect(arrayInstances, {showHidden: false, depth: 10, colors: true}));
        callback(null, arrayInstances);
      });

    }],
    get_obj_machine: ['get_machines', function(results, callback){

      var data = [];
      async.each(results.get_machines, function(value, callback_each){

        var port = '';
        _.each(value.metadata.items, function(value_port){
          if(value_port.key == 'docker-port'){
            port = value_port.value;
          }
        });

        var machineBody = new Dockerode({
          //host: _.get(value, 'networkInterfaces[0].accessConfigs[0].natIP'),
          host: _.get(value, 'networkInterfaces[0].networkIP'),
          port: port || 2375
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

      var container = [];

      async.each(results.get_obj_machine, function(value, callback_each){
        _.each(value, function(value_inside, key_inside){

          value_inside.listContainers(function (error, containers) {
            container[key_inside] = containers;
            callback_each();
          });
        });
      }, function(error){
        callback(null, container);
        //console.log('container', require('util').inspect(container, {showHidden: false, depth: 10, colors: true}));
      });
    }]
  }, function(error, result){
    //console.log('result', require('util').inspect(result.get_containers, {showHidden: false, depth: 10, colors: true}));
    done(null, result.get_containers);
  });

};







