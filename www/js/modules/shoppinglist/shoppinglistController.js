    // exports first! required for proper work of circular dependencies    
    module.exports = {

        init : init,
        reInit : reInit,
        addOfferItem : addOfferItem,
        addSimpleItem : addSimpleItem,
        decreaseOfferItem : decreaseOfferItem,
        getItemQtyInMyShoppingList : getItemQtyInMyShoppingList,
        getCurrentShoppingList : getCurrentShoppingList

    }

    var analytics = require('services/ga_analytics'),
        Navigation = require('modules/navigation/navigationController'),
        shoppinglistModel = require('modules/shoppinglist/shoppinglistModel'),
        shoppinglistView = require('modules/shoppinglist/shoppinglistView'),
        shoppinglistCollectionController = require('modules/shoppinglist/shoppinglistCollectionController'),
        shoppinglistCollection = require('modules/shoppinglist/shoppinglistCollectionModel'),
        constants = require('config/constants'),
        storage= require('services/storage'),
        categories = require('modules/navigation/categories'),
        utility= require('utils/utility'),
        autocomplete = require('modules/shoppinglist/autocompleteController'),

        bindings = [
         
              {
                element: document,
                delegate: '.item-action',
                event: 'click',
                handler: onItemActionClick,
                onlyOnCurrentPage : false
            },
      
              {
                element: document,
                delegate: '.action-remove',
                event: 'click',
                handler: onRemoveItemClick,
                onlyOnCurrentPage : false
            },

            {
                element: '.action-buy',
                event: 'click',
                handler: onBuyItemClick,
                onlyOnCurrentPage : true
            },
            {
                element: '.action-restore',
                event: 'click',
                handler: onRestoreItemClick,
                onlyOnCurrentPage : true
            },
            {
                element: '.pull-to-refresh-content',
                event: 'refresh',
                handler: onPTR,
                onlyOnCurrentPage : true
            },
            {
                element: document,
                delegate: '.swipeout.sl-simple-item',
                event: 'opened',
                handler: onSwipeoutOpened,
                onlyOnCurrentPage : false
            },
            {
                element: document,
                delegate: '.swipeout.sl-simple-item',
                event: 'closed',
                handler: onSwipeoutClosed,
                onlyOnCurrentPage : false
            },
             {
                element: '.expired',
                event: 'click',
                handler: onExpiredClick,
                onlyOnCurrentPage : true
            },
            {
                element: '.sl-actions',
                event: 'click',
                handler: onShoppinglistActionsClick,
                onlyOnCurrentPage : false           // it should be false, as sl-actions is in Navbar, not in page
            },
            {
                element: '.shoppinglist-toolbar',
                event: 'click',
                handler: onAllListsClick,
                onlyOnCurrentPage : true           // it should be false, as sl-actions is in Navbar, not in page
            },
            
        ],

        sortings = [
            {
                field : "id",
                fieldtype: "int",
                order: "asc"
            },
            {
                field : "expired",
                fieldtype: "bool",
                order: "falsefirst"
            },
            {
                field : "advertiser_id",
                fieldtype: "int",
                order: "desc"
            },
            {
                field : "type",
                fieldtype: "string",
                order: "desc"
            },
            {
                field : "crossedOut",
                fieldtype: "bool",
                order: "truefirst"
            },
        ];
     

    var SLCollection = new shoppinglistCollection(),
        currentShoppingList;

    var defaultShopListID = 1;   // 1 - ID for my list by default

    window.slimport = SLCollection.importList.bind(SLCollection);

    createMyShoppingList();   // if My list not yet created, create empty one

    function createMyShoppingList() {
        
        if (!SLCollection.getListById(defaultShopListID)) {
            SLCollection.lists.unshift(new shoppinglistModel());
            SLCollection.save();
        }

    }

    function init(page) {
                
        if (page.from == "left") return;    

        var list_id = page.query.id || defaultShopListID;

        var navigation = new Navigation("shoppinglist", false);

        categories.loadFilterItems("advertisers", false, function() {

            SLCollection.load();
            var list_data = SLCollection.getListById(list_id) || {};

            currentShoppingList = new shoppinglistModel(list_data);
            render(page);
            
            
        });
                                                        
    }


    function getCurrentShoppingList() {
        
        return currentShoppingList;
    }

    function initDefaultShoppingList() {

        var SLCollection = new  shoppinglistCollection(),
            list_data = SLCollection.getListById(defaultShopListID);

              if (list_data) {

                 currentShoppingList = new shoppinglistModel(list_data);
              
              }
              else {
                  currentShoppingList = new shoppinglistModel();
              }
    }

    function reInit(page) {
        
        render (page);
       
    }


    function render(page) {

        page = page || f7.getCurrentView().activePage;
        
        
        for (var i=0; i < sortings.length; i++) {
            currentShoppingList.items = utility.SortArrayBy(currentShoppingList.items, sortings[i].field, sortings[i].fieldtype, sortings[i].order);
        }

        addPrerenderData(currentShoppingList);

        shoppinglistView.render(page, currentShoppingList, bindings);

        if (SLCollection.getCount() > 1) shoppinglistView.renderToolbar();
        
        f7.pullToRefreshDone(); 

        autocomplete.init();

        analytics.trackView("shoppinglist");
    }



    function addPrerenderData(shoppingList) {
        
        var prev_adv_id = 0;

        for (var i=0;i< shoppingList.items.length; i++) {

            if (shoppingList.items[i].type == 'offer') {

                if (shoppingList.items[i].advertiser_id != prev_adv_id) {
                    
                    shoppingList.items[i].show_adv_divider = true;
                    shoppingList.items[i].advertiser_img = categories.getAdvertiserLogo(shoppingList.items[i].advertiser_id);
                }
                else {
                    shoppingList.items[i].show_adv_divider = false;
                }
                
                prev_adv_id = shoppingList.items[i].advertiser_id;
                
            }
            
        }

    }


    function onRemoveItemClick(e) {

        e.stopImmediatePropagation(); 
        var item_id = getItemIdForDOMElement(this);

        if (item_id) confirmDelete(item_id, function() {
            
            //shoppinglistView.renderHeader(f7.getCurrentView().activePage, currentShoppingList); 

        }, function(){});

            
    }

    function confirmDelete(item_id, cbDeleted, cbRejected) {
        
               f7.modal({
                            text: 'Remove this item from shopping list?',
                            buttons: [
                            {
                                text: 'No',
                                onClick: cbRejected
                            },
                            {
                                text: 'Yes',
                                bold: true,
                                onClick: function() {

                                  currentShoppingList.removeItem(item_id);
                                  //shoppinglistView.deleteItem(item_id);  // visually remove item from view
                                  shoppinglistView.render(f7.getCurrentView().activePage, currentShoppingList, bindings);
                                  cbDeleted();
                                    
                                }
                            }]
                        });

    }


     function getItemIdForDOMElement(element) {
                
                if (element) return $$(element).closest('li').data('id') || null;
    }



    function onItemActionClick(e) {


        e.stopImmediatePropagation(); 

        var item_id = getItemIdForDOMElement(this);
        var item_action = $$(this).data('action') || null;

        if (item_id && item_action) {

            switch (item_action) {

           
                
                case 'increase':
                    
                    var new_qty = currentShoppingList.modifyItemQuantity(item_id, 1);
                    shoppinglistView.setQuantity(item_id,  new_qty);
                    shoppinglistView.renderHeader(f7.getCurrentView().activePage, currentShoppingList); 
                    break;
                
                case 'decrease':

                    var new_qty = currentShoppingList.modifyItemQuantity(item_id, -1);
                    if (new_qty <= 0) {

                            confirmDelete(item_id, function() { /* deleted */}, 
                            
                            function() {
                                    // not deleted
                                    shoppinglistView.setQuantity(item_id, new_qty);
                                    shoppinglistView.renderHeader(f7.getCurrentView().activePage, currentShoppingList); 

                            });

                    } 
                    else {
                        
                        shoppinglistView.setQuantity(item_id, new_qty);  
                        shoppinglistView.renderHeader(f7.getCurrentView().activePage, currentShoppingList); 
                    }

                    
                    break;
                

                default:
                        break;
            }

              
             
        
        }

    }

    function addOfferItem(offer_item) {
        
        initDefaultShoppingList();   
        return currentShoppingList.addItem('offer', null, offer_item);

    }


    function addSimpleItem(name) {
        
        if (!currentShoppingList) initDefaultShoppingList();   
        
        var qty = currentShoppingList.addItem('simple', name);
        
        render();
        
        return qty;

    }
    
    function decreaseOfferItem(offer_id) {   // offer-item_id 
        
        initDefaultShoppingList();

        var sl_id = currentShoppingList.getIdByOfferId(offer_id);

        if (sl_id) {

            var new_qty = currentShoppingList.modifyItemQuantity(sl_id,-1);

            if (new_qty <= 0) currentShoppingList.removeItem(sl_id);

            return new_qty;

        }

        return 0;

        
    }

    
    
    function getItemQtyInMyShoppingList(offer_id) {
        
        var SLCollection = new shoppinglistCollection(),
            myShoppingListData = SLCollection.getListById(defaultShopListID);

        if (!myShoppingListData) return 0; 
        
        return new shoppinglistModel(myShoppingListData).getItemQuantityInList(offer_id);

}


    
    function onBuyItemClick(e) {
        
        var item_id = getItemIdForDOMElement(this);
         
        currentShoppingList.crossOutItem(item_id, true);
        shoppinglistView.render(f7.getCurrentView().activePage, currentShoppingList, bindings);
        
              
    }

    function onRestoreItemClick(e) {

        var item_id = getItemIdForDOMElement(this);
        
        currentShoppingList.crossOutItem(item_id, false);
        
        shoppinglistView.render(f7.getCurrentView().activePage, currentShoppingList, bindings);
                
    }

    function onPTR() {

                render(f7.getCurrentView().activePage);
            
    }

    function onSwipeoutOpened(e) {

        e.stopImmediatePropagation(); 

        if ($$(this).find('.swipeout-actions-right').hasClass('swipeout-actions-opened')) {

                $$(this).find('.item-title').css('left','120px');
            
        }
    }

    
    function onSwipeoutClosed(e) {

        e.stopImmediatePropagation(); 

                      var $el = $$(this).find('.item-title');

                      if ($el.css('left') == '120px') {
                          $el.css('left','0');

                      }

    }

    function onExpiredClick(e) {

        var item_id = getItemIdForDOMElement(this);

        if (item_id) {

                f7.modal({
                        text: 'Product already expired. Remove it from list?',
                        buttons: [
                        {
                            text: 'No',
                            
                        },
                        {
                            text: 'Yes',
                            bold: true,
                            onClick: function() {

                                currentShoppingList.removeItem(item_id);
                                
                                shoppinglistView.render(f7.getCurrentView().activePage, currentShoppingList, bindings);
                                
                                
                            }
                        }]
                    });
        }
    }

    function onAllListsClick(e) {

        
        shoppinglistCollectionController.init(SLCollection);
    }

    function onShoppinglistActionsClick(e) {

            var buttons1 = [
                  {
                    text: 'Arrange',
                     onClick: slActionReorder
                },
                {
                    text: 'Buy all',
                     onClick: slActionBuyAll
                },
                {
                    text: 'Remove bought',
                    onClick: slActionRemovePurchased
                },
                {
                    text: 'Remove expired',
                    onClick: slActionRemoveExpired
                },
                {
                    text: 'Clear all',
                    onClick: slActionRemoveAll
                },

            ];
            var buttons2 = [
                
                  {
                      text: 'Send list...',
                      onClick : slActionShare
                  }
                  
              ];
            var buttons3 = [
              
                {
                    text: 'Cancel',
                    color: 'red'
                    
                }
                
            ];
            
            var groups = [buttons1, buttons2, buttons3];
            f7.actions(groups);

 
    }

    
    function slActionReorder () {
        
        render();


    }

    function slActionBuyAll () {
        
        currentShoppingList.BuyAll();
        render();


    }


    function slActionRemoveAll () {

                      f7.modal({
                        text: 'All products will be removed from list. Continue?',
                        buttons: [
                        {
                            text: 'No',
                            
                        },
                        {
                            text: 'Yes',
                            bold: true,
                            onClick: function() {

                                currentShoppingList.RemoveAll();
                                render();
                            }
                        }]
                    });

    }


    
    function slActionRemovePurchased () {
        
        currentShoppingList.RemoveByCriteria('crossedOut');
        render();


    }


    
    function slActionRemoveExpired () {

        currentShoppingList.RemoveByCriteria('expired');
        render();


    }

    
    
    function slActionShare () {

        var message = currentShoppingList.generatePlainList();
        
                console.log(message);
                
                if (message.length == 0) {
        
                        f7.alert("No active products in list (list empty or all products are bought).");
                        return false;
                }
                else {
        
                    
                    // implement sending list yourself (via SMS/Messengers)
                }
        
    }





