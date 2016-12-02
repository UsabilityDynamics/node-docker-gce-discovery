var async = require('async');
var _ = require('lodash');
var debug = require('debug')('gce-discovery-gce');

/**
 *
 *
 * @param options
 * @param taskDone
 */
module.exports.getInstances = function getInstances( options, taskDone ) {

  var google = require('googleapis');

  if(typeof options.gceConfig == 'string'){
    var key = require( options.gceConfig );
  } else {
    var key = options.gceConfig;
  }

  var scopes = [
    'https://www.googleapis.com/auth/compute'
  ];

  var _data = {
    machines: []
  };

  var jwtClient = new google.auth.JWT(key.client_email, null, key.private_key, scopes, null);

  jwtClient.authorize(function(error, tokens) {

    if (error) {
      console.error( 'Google authorization error.' );
      return taskDone( error );
    }

    var compute = google.compute({ version: 'v1', auth: jwtClient });

    async.each( options.zones, function eachZone( zone, done ) {

      compute.instances.list({ project: options.project, zone: zone }, function(error, result) {
        //console.log(error, result);

        if( error ) {
          return done( new Error( 'Could not get anything from zone.' ) );
        }

        _.each(result.items, function eachMachine( machine ) {

          // look for varnish tag to detect
          // if( machine.tags.items.indexOf( 'varnish-server' ) < 0 ) { return; }

          //  if( machine.status !== 'RUNNING' ) { return; }

          // No public address.
          // if( !_.head( machine.networkInterfaces ).accessConfigs ) { return; }


          // if( !_.head( _.head( machine.networkInterfaces ).accessConfigs ).natIP  ) { return; }

          _data.machines.push(machine);

        });

        done();

      });

    }, haveMachines );

    function haveMachines( error ) {

      debug( 'haveMachines', _data.machines.length );

      taskDone( null, _data.machines );

    }
    // us-central1-b, us-central1-c

  });

};
