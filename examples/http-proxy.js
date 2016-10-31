var http = require('http');
var _ = require('lodash');
var httpProxy = require('http-proxy');

var dockerDiscoveryList = require( '../test/fixtures/docker-containers' );


setTimeout(function removeFromListAfterWait() {

  _.each(dockerDiscoveryList, function( value, key ) {

    if( value.Id === 'e95b656b6e7394daee50c7f9ac5ec55bca0397f3680ae0260cc466267afaa952' ) {
      console.log( "removed service-a" );
      delete dockerDiscoveryList[key];
    }

  });

  console.log( 'dockerDiscoveryList', dockerDiscoveryList );


}, 5000 );

var proxy = httpProxy.createServer();

http.createServer(function (req, res) {

  var _target = _.find(dockerDiscoveryList, {
    Labels: { 'app.path': req.url }
  });

  if( !_target ) {
    return res.end('not available' );
  }

  var target = { host: _.get( _target, 'Ports[0].IP' ), port: _.get( _target, 'Ports[0].PublicPort' ) };

  console.log( 'Forwaring [%s] to [%s:%s]', req.url, target.host, target.port );

  proxy.web(req, res, {target: target});

}).listen(8021);

setInterval(function() {
  console.log( "Currently there are [%s] containers in list.", dockerDiscoveryList.length );
}, 1000 );