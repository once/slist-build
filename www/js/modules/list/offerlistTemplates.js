// Data rendering templates

    var fs = require('fs'),
            
             templates = {
    
                'foods':      {
                    template: fs.readFileSync(__dirname + '/templates/foods.html', 'utf8')
                },
                
                'nodata' : {
                    template: fs.readFileSync(__dirname + '/templates/nodata.html', 'utf8')
                }

    };

    module.exports = {

        templates : templates
    }




    
    