var fs = require("fs"),
    path = require('path');

// Check if basic auth is available - all other modules checked as part of package.json
checkNodeModule('basic-auth');
var basicAuth = require('basic-auth');

/**
 * Simple basic auth middleware for use with Express 4.x.
 *
 * Based on template found at: http://www.danielstjules.com/2014/08/03/basic-auth-with-express-4/
 *
 * @example
 * app.use('/api-requiring-auth', utils.basicAuth('username', 'password'));
 *
 * @param   {string}   username Expected username
 * @param   {string}   password Expected password
 * @returns {function} Express 4 middleware requiring the given credentials
 */
function basicAuthUsernamePassword (username, password) {
  return function(req, res, next) {

    if (!username || !password) {
      console.log('Username or password is not set.');
      return res.send('<h1>Error:</h1><p>Username or password not set. <a href="https://github.com/alphagov/govuk_prototype_kit/blob/master/docs/deploying.md#3-set-a-username-and-password">See guidance for setting these</a>.</p>');
    }

    var user = basicAuth(req);

    if (!user || user.name !== username || user.pass !== password) {
      res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
      return res.sendStatus(401);
    }

    next();
  };
}

// Checks all modules in package.json are available, quit if not available
function checkNodeModules(){
  var env = process.env.NODE_ENV || 'development',
      packagePath = path.join(__dirname, '..', 'package.json'),
      nodeModules = require(packagePath);


  for (var nodeModule in nodeModules.dependencies) {
    checkNodeModule(nodeModule);
  }
  
  if (env.toLowerCase() === 'development'){
    for (var nodeModule in nodeModules.devDependencies) {
      checkNodeModule(nodeModule);
    }
  }
};

// Check a single node module, quit app if not available
function checkNodeModule(moduleName){
  if(isModuleAvailableSync(moduleName) !== true ){
    console.error('\nERROR: ' + moduleName + ' module missing. Try running `npm install`\n');
    process.exit(0);
  }
};

// checks if a given node module is available to load
function isModuleAvailableSync (moduleName){
  // return value, boolean
  var ret = false; 

  // scan each module.paths. If there exists
  // node_modules/moduleName then
  // return true. Otherwise return false.
  module.paths.forEach(function(nodeModulesPath) {
    var modulePath = path.join(nodeModulesPath, moduleName);
    if(fs.existsSync(modulePath) === true) {
      ret = true;
      // break forEach
      return false;
    }
  });
  return ret;
};



module.exports = {
  basicAuth: basicAuthUsernamePassword,
  checkNodeModules: checkNodeModules,
};
