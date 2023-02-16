const restify = require('restify');

function respond(req, res, next) {
	res.send('hello ' + req.params.name);
	next();
  }
  
var server = restify.createServer();
server.get('/hello/:name', respond);
server.head('/hello/:name', respond);

server.listen(8080, function() {
console.log('%s listening at %s', server.name, server.url);
});

const knex = require('knex')({
	client: 'mysql',
	connection: {
	  host : '127.0.0.1',
	  port : 3306,
	  user : 'your_database_user',
	  password : 'your_database_password',
	  database : 'myapp_test'
	}
  });
