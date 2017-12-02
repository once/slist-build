
var shoppinglistCollectionView = require('modules/shoppinglist/shoppinglistCollectionView');


var  bindings = [
                  {
                    element: '.action-remove-list',
                    event: 'click',
                    handler: onRemoveListClick,
                    onlyOnCurrentPage : true
                    }
                ];

var currentSLCollection;


function init(shoppinglistCollection) {

    currentSLCollection = shoppinglistCollection;

    shoppinglistCollectionView.render(shoppinglistCollection, bindings);

}


function getItemIdForDOMElement(element) {
                
    if (element) return $$(element).closest('li').data('id') || null;

}


function onRemoveListClick(e) {

    e.stopImmediatePropagation(); 
    var list_id = getItemIdForDOMElement(this);

    if (list_id) confirmDelete(list_id, function() {
            
        

    }, function(){});
        
}

function confirmDelete(list_id, cbDeleted, cbRejected) {
        
    f7.modal({
                text: 'Remove this list?',
                buttons: [
                {
                    text: 'No',
                    onClick: cbRejected
                },
                {
                    text: 'Yes',
                    bold: true,
                    onClick: function() {

                        currentSLCollection.removeList(list_id);
                        
                        shoppinglistCollectionView.render(currentSLCollection, bindings);
                        
                        cbDeleted();
                        
                    }
                }]
            });

}


module.exports = {

    init : init

}