var discoveryInstance = require('../index').create({
  gceConfig: {},
  machineTags: [ 'docker-server' ], // required tags a GCE machine must have to be monitored
  dockerPort: 12110, // which port on the found machines to use to connect
  watch: true // if enabled watch Docker Daemon for changes
});


module.exports = {

  /**
   *
   * @author kavaribes@UD
   */

  "can't using credential object": function (done) {
    this.timeout(20000);

    discoveryInstance.error.message.should.be.equal('No key or keyFile set.');
    console.log(discoveryInstance.error.message);
    done();

  },

}
