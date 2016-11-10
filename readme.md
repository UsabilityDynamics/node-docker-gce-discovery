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
```js
discoveryInstance.containers //has containers list.
```

```js
discoveryInstance.machines //has machines list.
```
