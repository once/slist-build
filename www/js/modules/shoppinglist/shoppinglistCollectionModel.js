
module.exports =  ShoppinglistCollection;

var constants = require('config/constants'),
    storage= require('services/storage'),
    serverapi = require('services/serverapi'),
    appState = require('config/appstate'),
    shoppinglistModel = require('modules/shoppinglist/shoppinglistModel');

    
function ShoppinglistCollection() {

    this.load();
    

}

ShoppinglistCollection.prototype.load = function() {
     
     this.lists = JSON.parse(storage.getItem(constants.storage.shoppinglists)) || [];

}

ShoppinglistCollection.prototype.save = function() {

      storage.setItem(constants.storage.shoppinglists, JSON.stringify(this.lists));

}

ShoppinglistCollection.prototype.getCount = function() {

      return this.lists.length;

}

ShoppinglistCollection.prototype.getListById = function(id) {

    return this.lists.find(function(item) {
        return item.id == id ? true : false;
    });

}

ShoppinglistCollection.prototype.getListByServerId = function(server_list_id) {

    return this.lists.find(function(item) {
        
        if ((typeof item.server_id != "undefined") && (item.server_id == server_list_id)) return true;
        
        return false;
    });

}

ShoppinglistCollection.prototype.getNewListId = function() {

    if (this.lists.length == 0) this.load();

    var max_id = 1;   // all new lists should have ID>1 (Id=1 - reserved for My List)

    for (var i=0; i < this.lists.length; i++) {
       if (this.lists[i].id > max_id) max_id = this.lists[i].id;
    }
    
    return max_id+1;

}


ShoppinglistCollection.prototype.getListIndexById = function(list_id) {

    return this.lists.findIndex(function(element) {

                return element.id == list_id ? true : false;
            });

}

ShoppinglistCollection.prototype.importList = function(list_id) {

    var currSLCollection = this;

    serverapi.ImportShoppingList(list_id, 
    
        function(data) {    // success
            
            var importedListId = currSLCollection.importFromJSON(data);
            if (importedListId) f7.getCurrentView().router.loadPage('shoppinglist.html?id='+importedListId);
        },
        
        function() { // error

            f7.alert("Error importing list ID " + list_id);

        });

}

ShoppinglistCollection.prototype.importFromJSON = function(listDataJSON) {

    
    if (listDataJSON) {

        try {
            
             var listData = JSON.parse(listDataJSON).list || {};

        }
        catch (e) {

                console.log('Empty list will not be imported');
                return;
        }

        if (listData.items.length == 0) return;
        
        if ((typeof appState.get("UserPushID") == "undefined") || (appState.get("UserPushID").length == 0)) throw new Error("Error while determining current user Push_ID"); 
        
        // won't import your list
        if (appState.get("UserPushID") == listData.owner_id) {
            
            f7.alert("er");
            return false;
        }
        
        var existingList = this.getListByServerId(listData.id);
        if (typeof existingList == "undefined") {   
                
                // если этот список еще не был импортирован ни разу, создаем новый список
                var newListId = this.getNewListId();

                var newListOptions = {
                    server_id : listData.id,
                    id : newListId,
                    name : 'Полученный список ' + newListId,
                    items : listData.items || []
                };
                
                this.lists.push(new shoppinglistModel(newListOptions));

        }
        else {
            
            // если этот уже был импортирован просто заменяем в нем элементы
            var newListId = existingList.id;
            existingList.items = listData.items;

        }
      
        this.save();
        
        return newListId;

    }

}

ShoppinglistCollection.prototype.exportList = function(listId, success, error) {
    
    var list = this.getListById(listId);

    if (typeof list == "undefined") throw new Error("Список с ИД " + listId + " не найден"); 

    if ((typeof window.plugins == "undefined") || (typeof window.plugins.OneSignal == "undefined")) throw new Error("Ошибка определения идентификатора пользователя"); 
        
         window.plugins.OneSignal.getIds(function(ids) {
            
            /*var ids = {
                userId : "ae133e5e-0ec2-42fc-9767-5e9a74eab1a9"
            };*/

            var export_data = {
                user_id : ids.userId,
                list : list
            };

            serverapi.ExportShoppingList(export_data, 
            
                function(data, status, xhr) {
                    
                    var created_list_id = JSON.parse(data).list_id || null;
                    
                    if (created_list_id) {
                        success(created_list_id, export_data.user_id);
                        return true;
                    }
                    else {
                        var error_text = "При отправке списка возникла ошибка.";
                        f7.alert(error_text);
                        throw new Error(error_text);

                    }
                    
                },
                function (){ 
                    var error_text = "При отправке списка возникла ошибка.";
                    f7.alert(error_text);
                    throw new Error(error_text);
                }
            );
            
        }); 

}


ShoppinglistCollection.prototype.getListIndexById = function(list_id) {

    return this.lists.findIndex(function(element) {

                return element.id == list_id ? true : false;
            });

}



ShoppinglistCollection.prototype.removeList = function (list_id) {
      
        var list_index = this.getListIndexById(list_id);

        if (list_index != -1 ) {

            this.lists.splice(list_index,1);   
            this.save();
        }

}





