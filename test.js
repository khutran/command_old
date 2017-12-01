const EventEmitter = require('events');
const stream = require('stream');

class MyStream extends stream {
  writes(data) {
    this.emit('data1', data);
  }
  read(data) {
  	// this.writes(data);
  	// console.log('data', data);
  }
}

module.exports = {
	MyStream:MyStream
}