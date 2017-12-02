
var constants = require('config/constants');

module.exports = {

     nodes : [

            {page:"offers.html?section=foods",iconclass: "icon-shopping-cart", name: constants.messages.sections["foods"].title, fontsize: 17},
            {page:"shoppinglist.html",iconclass: "icon-checklist", name: "Shopping list", fontsize: 24},
            {page:"about.html?section=contacts",iconclass: "icon-envelope", name: constants.messages.sections["contacts"].title, fontsize: 17},
            {page:"settings.html?section=settings",iconclass: "icon-cog3", name: constants.messages.sections["settings"].title, fontsize: 17}

            ]
 
        
};

