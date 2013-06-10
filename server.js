var connect = require('connect');
var server = connect()
  .use(connect.static(__dirname))
  .use(connect.directory(__dirname))
  .listen(8080);