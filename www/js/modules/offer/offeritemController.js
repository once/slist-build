var f7 = require('f7'),
    appConfig = require('config/appconfig'),
    app = require('app'),
    serverapi = require('services/serverapi'),
    constants = require('config/constants'),
    offeritemView = require('modules/offer/offeritemView'),
    sectionModel = require('modules/navigation/sections'),
    analytics= require('services/ga_analytics'),
    utility= require('utils/utility'),
    shoppinglist = require('modules/shoppinglist/shoppinglistController');
    

  var item;
  var itemtype;
  var offer_id;
  
  var bindings = [
    {
        element: '.add-to-shoppinglist',
        event: 'click',
        handler: onAddToShoppingList,
        onlyOnCurrentPage : true
        
    },
    {
        element: '.remove-from-shoppinglist',
        event: 'click',
        handler: onRemoveFromShoppingList,
        onlyOnCurrentPage : true
        
    }
  ];
            

    function init (page) {

            itemtype = page.query.type;
            offer_id = page.query.id;
                                
            render();

    }

            
    function render() {
        

            serverapi.loadOfferPage(itemtype, offer_id, function(data) {

                    item = (JSON.parse(data)).offer;

                    var offer_full_title = item.name,
                        offer_advertiser_id =  item.advertiser_id || constants.undefined_mark,
                        offer_advertiser_name = item.advertiser || constants.undefined_mark,
                        offer_cat_name = item.cat_name || constants.undefined_mark,
                        offer_section_name = item.sec_name || constants.undefined_mark;

                        item.qtyInShoppingList = shoppinglist.getItemQtyInMyShoppingList(item.id);
                        item.priceInShoppingList = (item.qtyInShoppingList * item.price_new).toFixed(2);

                    offeritemView.render(item, itemtype, offer_advertiser_name, bindings);
                    
                    if (sectionModel[itemtype].bottomToolbar) {
                        
                        renderToolbar({
                                        quantity: item.qtyInShoppingList, 
                                        price: item.priceInShoppingList
                                    });
                    }
                    

                    analytics.trackOfferView (offer_id, offer_full_title, offer_advertiser_id, offer_advertiser_name, offer_section_name, offer_cat_name);
                
        }, 
        function() {
    
            offeritemView.renderError();
        });    

    }

    function onAddToShoppingList() {
        
                ModifyShoppingListQuantity(1);
        
                
                
            }
        
            function onRemoveFromShoppingList() {
                
                ModifyShoppingListQuantity(-1);
        
            }
        
           
        
        
            function ModifyShoppingListQuantity(addValue) {
                    
                    var newItemQuantity = (addValue > 0) ? shoppinglist.addOfferItem(item) : shoppinglist.decreaseOfferItem(offer_id);
                    var newItemPrice = newItemQuantity * item.price_new;
                    
                    renderToolbar({
                                    quantity: newItemQuantity, 
                                    price: newItemPrice.toFixed(2)
                                });
            }
        
            function renderToolbar(model)  {
        
                 var toolbarViewModel  = {
                            quantity: model.quantity,
                            price : model.price,
                            bindings : [ 
                                            {
                                                element: '.add-to-shoppinglist',
                                                event: 'click',
                                                handler: onAddToShoppingList,
                                                onlyOnCurrentPage : true
                                                
                                            },
                                            {
                                                element: '.remove-from-shoppinglist',
                                                event: 'click',
                                                handler: onRemoveFromShoppingList,
                                                onlyOnCurrentPage : true
                                                
                                            }
                                        ]
                    
                    };
                    
                    offeritemView.renderToolbar(toolbarViewModel);
        
            }
        

        
        module.exports =  {

            init : init

        }

