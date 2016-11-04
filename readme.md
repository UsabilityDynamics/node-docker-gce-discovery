A Node.js library for discovering Docker containers across Google Cloud Compute machines.

* Discover GCE machines in zone by tag.
* Connect to Docker Daemon on each GCE machine, get list of containers, filtered by a label and status.
* Subscribe to Docker Daemon changes and emit local event on each change in container list.


### Usage
To use a Google Cloud service account token is required.

```js
var discoveryInstance = require('docker-gce-discovery').create({
  gceConfig: '..path to service account JSON file or the object itself...',
  machineTags: [ 'docker-machine' ], // required tags a GCE machine must have to be monitored
  dockerPort: 2280, // which port on the found machines to use to connect
  watch: true // if enabled watch Docker Daemon for changes
});
```
discoveryInstance.containers has containers list.

discoveryInstance.machines has machines list.

Callback triggered once we have list of containers across our cluster, or something went wrong

```js
discoveryInstance.once('ready',function haveContainerList( error, containerList ) {
  // here we can do something with the containerlist, an array of Docker Containers
});
```

If we use the `watch:true` option, then our instance will maintain a connection to each Docker Daemon and watch for changes:

```js
discoveryInstance.on('change', function containerListChange( error, containerList ) {
  // updated containerList including whatever container was added/removed
});
```

In case any errors occur, perhaps a watched connection is interrupted:
```js
discoveryInstance.on('error', function generalError( error ) {
  // error details
});
