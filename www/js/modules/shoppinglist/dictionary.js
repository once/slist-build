  var fs = require('fs'),
      data = fs.readFileSync(__dirname + '/allproducts.txt', 'utf8');

module.exports = $$.unique(data.split(/[\n\r]/g));

        