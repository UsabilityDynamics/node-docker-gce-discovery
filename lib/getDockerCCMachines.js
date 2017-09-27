var gce = require('./gce');
var async = require('async');
var _ = require('lodash');

module.exports.getDockerCCMachines = function getDockerCCMachines( options, done ) {

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
      console.log('getDockerCCMachines.js', require('util').inspect('get_obj_machine', {showHidden: false, depth: 10, colors: true}));
      //console.log('results.get_machines', require('util').inspect(results.get_machines, {showHidden: false, depth: 10, colors: true}));
      var data = [];
      async.each(results.get_machines, function(value, callback_each){
        // var port = '';
        // _.each(value.metadata.items, function(value_port){
        //   if(value_port.key == 'docker-port'){
        //     port = value_port.value;
        //   }
        // });
        var machineBody = {
          name: _.get(value, 'name'),
          internal: _.get(value, 'networkInterfaces[0].networkIP'),
          external: _.get(value, 'networkInterfaces[0].accessConfigs[0].natIP'),
        };
        data.push(machineBody);

        callback_each();

      }, function(error){

        callback(null, data);

      });
    }],
  }, function(error, result){
    //console.log('result', require('util').inspect(result.get_containers, {showHidden: false, depth: 10, colors: true}));
    //console.log('getDockerContainers.js', require('util').inspect('done function', {showHidden: false, depth: 10, colors: true}));
    done(null, result);
  });

};
