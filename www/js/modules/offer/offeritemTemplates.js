
    var fs = require('fs');

    var templates = {
    
                
                'foods':      {
                    template: fs.readFileSync(__dirname + '/templates/food.html', 'utf8'),
                    swiper : false
                },
                
                'loaderror' : {
                    template: fs.readFileSync(__dirname + '/templates/error.html', 'utf8'),
                },
                'toolbar' : {
                    template: fs.readFileSync(__dirname + '/templates/toolbar.html', 'utf8'),
                },

    };

    module.exports = {

        templates : templates
    }




    
    