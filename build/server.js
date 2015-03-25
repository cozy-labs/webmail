// Generated by CoffeeScript 1.9.0
var americano, application;

americano = require('americano');

application = module.exports.start = function(options, callback) {
  if (options == null) {
    options = {};
  }
  options.name = 'webmail';
  if (options.root == null) {
    options.root = __dirname;
  }
  if (options.port == null) {
    options.port = process.env.PORT || 9125;
  }
  if (options.host == null) {
    options.host = process.env.HOST || '0.0.0.0';
  }
  if (callback == null) {
    callback = function() {};
  }
  return americano.start(options, function(app, server) {
    return callback(null, app, server);
  });
};

if (!module.parent) {
  application();
}
