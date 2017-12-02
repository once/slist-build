
module.exports = ShoppingList;

var listItemModel = require('modules/shoppinglist/listItemModel'),
    constants = require('config/constants'),
    storage= require('services/storage'),
    utility= require('utils/utility'),
    fs = require('fs'),
    plainListTemplate = fs.readFileSync(__dirname + '/templates/plainlist.html', 'utf8'),
    plainListCompiledTemplate = Template7.compile(plainListTemplate),
    shoppinglistCollection = require('modules/shoppinglist/shoppinglistCollectionModel');

function ShoppingList(data) {
    
    var data = data || {};

    var defaults= {
        id : 1,
        server_id : null,
        name : 'My list',
        comment : '',
        items : []

    };

    this.id = data.id || defaults.id;
    this.server_id = data.server_id || defaults.server_id;
    this.name = data.name || defaults.name;
    this.comment = data.comment || defaults.comment;
    this.items = data.items || defaults.items;

    for (var i=0; i< this.items.length; i++) {

        this.items[i].expired = utility.IsItemExpired(this.items[i]);
    }
}


ShoppingList.prototype.getItemById = function(item_id) {

    return this.items.find(function(arrayitem, index, ar) {
            return arrayitem.id ==item_id

        });

}


ShoppingList.prototype.getItemByOfferId = function(offer_id) {

    return this.items.find(function(arrayitem, index, ar) {
            return ((arrayitem.offer_id == offer_id) && (!arrayitem.crossedOut));

        });

}

ShoppingList.prototype.getItemByName = function(name) {

    return this.items.find(function(arrayitem, index, ar) {
            return ((arrayitem.name.trim().toLowerCase() == name.trim().toLowerCase()) && (!arrayitem.crossedOut));

        });

}

ShoppingList.prototype.getIdByOfferId = function(offer_id) {

    var item = this.items.find(function(arrayitem, index, ar) {
            return arrayitem.offer_id ==offer_id

        });
    
    if (!item) return null;

    return item.id;

}

ShoppingList.prototype.getItemIndexById = function(item_id) {

    return this.items.findIndex(function(element, index, ar) {

                return element.id == item_id ? true : false;
            });

}

ShoppingList.prototype.getNewId = function() {

    var max_id = 0;

    for (var i=0; i < this.items.length; i++) {
       if (this.items[i].id > max_id) max_id = this.items[i].id;
    }
    
    return max_id+1;

}


ShoppingList.prototype.addItem = function(type, name, offer_item) {

        if ((type == 'simple') && (name.trim().length == 0)) return 0;

        var existing_item = (type == 'simple') ? this.getItemByName(name) : this.getItemByOfferId(offer_item.id);
        var new_qty;

        if (existing_item) {
            existing_item.quantity += 1;
            new_qty = existing_item.quantity;
        }
        else {
            var listItem = (type == 'simple') ? this.createSimpleItem (name) : this.createOfferItem (offer_item);
            
            this.items.unshift(listItem);
            new_qty = listItem.quantity;
        }
        
        this.saveChanges();
       
        return new_qty;

}

ShoppingList.prototype.createSimpleItem = function (name) {

            return new listItemModel.listItem({ 
                                        id :  this.getNewId(),
                                        name : name,
                                        type : 'simple',
                                        quantity : 1
                                        
                                     });
            
}

ShoppingList.prototype.createOfferItem = function (offer_item) {

       return new listItemModel.listItem({ 
                                        id : this.getNewId(),
                                        name : offer_item.name,
                                        type : 'offer',
                                        offer_id : offer_item.id,
                                        quantity : 1,
                                        img : offer_item.img,
                                        advertiser : offer_item.advertiser,
                                        advertiser_id :  offer_item.advertiser_id,
                                        system_date_to : offer_item.system_date_to,
                                        price_old : offer_item.price_old,
                                        price_new : offer_item.price_new
                                        
                                     });        
            
}





ShoppingList.prototype.removeItem = function (item_id) {
      
        var item_index = this.getItemIndexById(item_id);

        if (item_index != -1 ) {

            this.items.splice(item_index,1);   
            this.saveChanges();
        }

}


ShoppingList.prototype.crossOutItem = function (item_id, crossOutToggle) {

        var item = this.getItemById(item_id);
        
        if (!item) return false;

        item.crossedOut = crossOutToggle;
        this.saveChanges();

}

ShoppingList.prototype.modifyItemQuantity = function(item_id, amount) {
        
        var item = this.getItemById(item_id);
        
        if (!item) return 0;

        if ((item.quantity + amount) >= 0) {
            
            item.quantity += amount;
            this.saveChanges();

        } 

        return item.quantity;

}

ShoppingList.prototype.editSimpleItem = function (options) {

    var item = this.getItemById(options.id);

    if (item && item.type == "simple") {
        item.name =  options.name || item.name;
        item.quantity = options.quantity || item.quantity;
        item.price_new = options.price_new;

        this.saveChanges();
    }


}

ShoppingList.prototype.getItemQuantityInList = function(offer_id) {

      var item = this.getItemByOfferId(offer_id);
        
       if (!item) return 0;

       return item.quantity;

}

ShoppingList.prototype.BuyAll = function() {

    for (var i=0; i < this.items.length; i++) {
        this.items[i].crossedOut = true;
    }
    
    this.saveChanges();
}

ShoppingList.prototype.RemoveAll = function() {

    
    this.items = [];
    this.saveChanges();
}


ShoppingList.prototype.RemoveByCriteria = function(criteria_field) {

    var i = this.items.length;
    while (i--) {   // reverse because splice works correctly only in this way

        if (this.items[i][criteria_field]) this.items.splice(i, 1);   

    }

    this.saveChanges();
}


ShoppingList.prototype.saveChanges = function() {
    
    var SLCollection = new shoppinglistCollection(),
        listIndex = SLCollection.getListIndexById(this.id);

    if (listIndex == -1) listIndex = 0
        
        SLCollection.lists[listIndex] = this;
        SLCollection.save();

    

}

ShoppingList.prototype.getListParams = function() {

    var goods_number = 0,
    sum_old= 0,
    sum_new = 0,
    sum_new_special = 0,    
    economy_percent = 0,
    economy_money = 0;

    for (var i=0; i < this.items.length; i++) {

        if (shouldIncludeItem(this.items[i])) {
            
            goods_number++;

            sum_new += +calcSumNew(this.items[i]);     // '+' for type cast

            sum_new_special += +calcSumNewSpecial(this.items[i]); 

            economy_money += +calcEconomy(this.items[i]);
            
            sum_old += +calcSumOld(this.items[i]);

        }
    }
    
    economy_percent = Math.round(((sum_old - sum_new_special) / sum_old)*100);
    
    var params = {

        number: goods_number,
        sum: sum_new.toFixed(2),
        economy_percent: economy_percent,
        economy_money: economy_money.toFixed(2)

    };

    
    
    return params;

        function shouldIncludeItem(item) {
            
            return ((!item.crossedOut) && (!item.expired) && (item.quantity > 0));
        }


        function calcSumOld(item) {
            
            return (item.price_old * item.quantity);
            
            
            
        }
        
        
        function calcSumNew(item) {
            return (item.price_new * item.quantity);
        }

        
    
        function calcSumNewSpecial(item) {

            if (item.price_old && (+item.price_old > 0) ) return (item.price_new * item.quantity);
            
            return 0;
            
        }


        function calcEconomy (item) {
            
            var economy_per_item = 0;

            if (item.price_old && (+item.price_old > 0) ) economy_per_item = item.price_old - item.price_new;
            
            return economy_per_item * item.quantity;
            
        }
    
}

ShoppingList.prototype.generatePlainList = function() {

      
        var listParams = this.getListParams();
        
        var plainListViewModel = {

            items : this.items.reduce(function(result, item) {
                          if (shouldIncludeItem(item)) result.push(item);
                          return result;
                    },[]),
            number : listParams.number,
            sum:     listParams.sum
            
        };
        

        return plainListCompiledTemplate(plainListViewModel).replace(/\n|\r/g, ""); // without line-breaks


            function shouldIncludeItem(item) {
                
                return ((!item.crossedOut) && (!item.expired) && (item.quantity > 0));
            }

}
