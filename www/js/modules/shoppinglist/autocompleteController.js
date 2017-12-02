var f7 = require('f7'),
    dictionary = require('modules/shoppinglist/dictionary'),
    shoppinglist = require('modules/shoppinglist/shoppinglistController');



function init () {

    var autocompleteDropdownExpand = f7.autocomplete({
        input: $$(f7.getCurrentView().activePage.container).find('#autocomplete-dropdown-expand'),
        openIn: 'dropdown',
        expandInput: true, // expand input
        dropdownPlaceholderText : "Enter product name",
        source: function (autocomplete, query, render) {
            var results = [];
            if (query.length === 0) {
                render(results);
                return;
            }
            // Find matched items
            for (var i = 0; i < dictionary.length; i++) {
                if (dictionary[i].toLowerCase().indexOf(query.toLowerCase()) >= 0) results.push(dictionary[i]);
            }
            // Render items by passing array with result items
            render(results);
        },
        
        onOpen : onAutocompleteOpen,
        onClose : onAutocompleteClose,
        onChange: onAutocompleteChange
        
    });

}

function onAutocompleteOpen(autocomplete) {
  
}
function onAutocompleteClose(autocomplete) {
    
    var value = autocomplete.input.val();
    shoppinglist.addSimpleItem(value);
    $$(autocomplete.input).val("");
   
 
}
function onAutocompleteChange(autocomplete, value) {
    
    
}


module.exports = {

    init : init

}