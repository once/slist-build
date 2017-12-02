var f7 = require('f7'),
    simpleitemView = require('modules/shoppinglist/simpleitemView'),
    shoppinglistController = require('modules/shoppinglist/shoppinglistController');

var bindings = [
            {

                element: '.save-action',
                event: 'click',
                handler: onSaveItemClick,
                onlyOnCurrentPage : false

            }];


function init (page) {
    
    var item_id = page.query.id;

    if (item_id) simpleitemView.render(shoppinglistController.getCurrentShoppingList().getItemById(item_id), bindings);

}

function onSaveItemClick() {

    
    var formDataProcessed = processForm(f7.formToData("#simpleitemEdit"));

    if (validateForm(formDataProcessed)) {

        shoppinglistController.getCurrentShoppingList().editSimpleItem(formDataProcessed);
        f7.getCurrentView().router.back();
    } 

    
    
    
}

function processForm(data) {

    return {
        id : data.id || null,
        name : data.name.trim() || "",
        quantity : parseInt(data.quantity) || 0,
        price_new : parseInt(data.price_new) || null
    };

}

function validateForm(data) {
    
        if (!data.id) return false;

        if (data.name.length == 0) {
            f7.alert("Title cannot be empty !");
            return false;
        }

        if (data.quantity <= 0) {
            
            f7.alert("Quantity should be greater than 0 !");
            return false;
        }
        
         if (data.price_new < 0) {
            
            f7.alert("Price should not be less than 0 !");
            return false;
        }

        return true;

}


module.exports = {

    init : init
}