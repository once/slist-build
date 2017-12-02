  var f7 = require('f7'),
       fs = require('fs'),
       utility = require('utils/utility'),
       shoppinglistHeaderTemplate = fs.readFileSync(__dirname + '/templates/header.html', 'utf8'),
       shoppinglistHeaderCompiledTemplate = Template7.compile(shoppinglistHeaderTemplate),
       shoppinglistItemsTemplate = fs.readFileSync(__dirname + '/templates/items.html', 'utf8'),
       shoppinglistItemsCompiledTemplate = Template7.compile(shoppinglistItemsTemplate),
       noDataTemplate = fs.readFileSync(__dirname + '/templates/nodata.html', 'utf8'),
       noDataCompiledTemplate = Template7.compile(noDataTemplate);
       
       

function render (page, shoppinglist, bindings) {

   
 

    if (shoppinglist && shoppinglist.items.length > 0) {

        
        renderHeader(page, shoppinglist);         
        
        // Items
                $$(page.container).find('.page-content .shopping-list').html(shoppinglistItemsCompiledTemplate(shoppinglist));
                
                f7.initImagesLazyLoad(page.container);
                
                

    }
    else {
          
        $$(page.container).find('.shoppinglist-header').hide();        
        $$(page.container).find('.page-content .shopping-list').html(noDataCompiledTemplate());

    }

    utility.bindEvents(page, bindings);



    

}

function renderToolbar() {
     
    var $toolbar =  $$(f7.getCurrentView().activePage.container).find('.toolbar');

    $toolbar.show();

}

function renderHeader(page, shoppinglist) {

    // Header
    $$(page.container).find('.shoppinglist-header').html(shoppinglistHeaderCompiledTemplate(shoppinglist.getListParams()));
    $$(page.container).find('.shoppinglist-header').show();        
}


   
function deleteItem(item_id) {
    
    
    $$(f7.getCurrentView().activePage.container).find('.page-content .shopping-list li[data-id="' + item_id  +'"]').remove()

}

function setQuantity(item_id, quantity) {
    
    $$(f7.getCurrentView().activePage.container).find('.page-content .shopping-list li[data-id="' + item_id + '"] .shoppinglist-quantity').html(quantity)

}





module.exports = {

    render : render,
    renderHeader : renderHeader,
    renderToolbar : renderToolbar,
    deleteItem : deleteItem,
    setQuantity : setQuantity
}