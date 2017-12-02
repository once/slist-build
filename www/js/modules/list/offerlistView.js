    
    var f7 = require('f7'),
        fs = require('fs'),
        constants = require('config/constants'),
        utility = require('utils/utility'),
        offerlistTemplates = require('modules/list/offerlistTemplates');
    
    utility.compileTemplates(offerlistTemplates.templates);

    function render(itemtype, items, postRenderCallback) {

            var selectorVList = $$(f7.getCurrentView().activePage.container).find('.virtual-list');
            selectorVList.html('');    // clean previous 'no-data message', if it existed..

            var paramsVList = {
                        items: items,
                        cache : true,
                        height: 96,        // it's height of <li> with it's margin-bottom! now it's 90px+6px !!!
                        template: offerlistTemplates.templates[itemtype].template,
                        item_multiplier: 1,
                        //add_height: 50,  // if needed, can add to vList height
                        searchByItem: searchFunction,
                        callback: postRenderCallback

            };

            var vList = f7.virtualList(selectorVList, paramsVList);

    
        
    }

    function searchFunction(query, index, item) {
        
        if ((item.name.toLowerCase().indexOf(query.toLowerCase().trim()) >= 0) || (item.advertiser.toLowerCase().indexOf(query.toLowerCase().trim()) >= 0) || (item.metakeywords.toLowerCase().indexOf(query.toLowerCase().trim()) >= 0)) {
            return true; //item matches query
        }
        else {
            return false; //item doesn't match
        }
        
    }

    
    function renderNoData(appliedFilters, bindings) {

        appliedFilters = appliedFilters || '';

        var selectorVList = $$(f7.getCurrentView().activePage.container).find('.virtual-list');
        selectorVList.html(offerlistTemplates.templates['nodata'].compiledTemplate(appliedFilters));
        utility.bindEvents(f7.getCurrentView().activePage, bindings);

    }

    function SetItemQuantity(element, quantity) {
        
        $$(element).siblings('.shoppinglist-quantity').html(quantity);
    }

    function SetItemPrice(element, price) {
        
        $$(element).siblings('.swipe-action-bottom').html(price.toFixed(2) + " $");
    }
              
                    
      
    module.exports = {

        render : render,
        renderNoData : renderNoData,
        SetItemQuantity : SetItemQuantity,
        SetItemPrice : SetItemPrice
     
    }
