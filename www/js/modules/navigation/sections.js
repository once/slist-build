var constants = require("config/constants");

    module.exports = {
              

                "foods" : {
                
                                title:  constants.messages.sections["foods"].title,
                                headerType : "combined-selector",
                                headerText : constants.messages.sections["foods"].headerText,
                                selectorHeaderText : constants.messages.sections["foods"].selectorHeaderText,
                                filterItemsDataVertical: {
                                        filterItemsType : "advertisers",
                                        sort_field : "name",
                                        sort_field_type :"string",
                                        sort_order : "asc",
                                        filter_fields : ["section_id"],
                                        items_filter_by_field : "advertiser_id",
                                        items_filter_by_field_display_name : constants.messages.sections["foods"].filters.vertical.items_filter_by_field_display_name,
                                        all_selector_name : constants.messages.sections["foods"].filters.vertical.all_selector_name,
                                },
                                filterItemsDataHorizontal: {
                                        filterItemsType : "categories",
                                        sort_field : "disp_order",
                                        sort_field_type :"int",
                                        sort_order : "asc",
                                        filter_fields : ["section_id","parent_id"],
                                        items_filter_by_field : "category",
                                        items_filter_by_field_display_name : constants.messages.sections["foods"].filters.horizontal.items_filter_by_field_display_name,
                                        all_selector_name : constants.messages.sections["foods"].filters.horizontal.all_selector_name,
                                },
                                bottomToolbar : true
                },
        "contacts" : {
                
                title:  constants.messages.sections["contacts"].title,
                headerType : "title"
        },
        "shoppinglist" : {
                
                title:  "Список покупок",
                headerType : "title",
                canAddToFavourites : false
        },
        "settings" : {
                
                title:  constants.messages.sections["settings"].title,
                headerType : "title"
        },
         "developer" : {
                
                title:  "DeveloperConsole",
                headerType : "title"
                
        },
         "complain" : {
                
                title:  "complain",
                headerType : "title"
                
        }
        };

