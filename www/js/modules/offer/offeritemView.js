
   var f7 = require('f7'),
       constants = require('config/constants'),
       utility= require('utils/utility'),
       offeritemTemplates= require('modules/offer/offeritemTemplates');

    utility.compileTemplates(offeritemTemplates.templates);

    var navbarContainer;
    


    
    
    function render(item, itemtype, advertiser_name, bindings) {
       
       navbarContainer = f7.getCurrentView().activePage.navbarInnerContainer; 
       
       var navbar_title = (advertiser_name.length > 20) ? advertiser_name.substring(0,20) + '...' :  advertiser_name;
       $$(navbarContainer).find('.center').html(navbar_title);

       f7.sizeNavbars();



       $$(f7.getCurrentView().activePage.container).find('.page-content').html(offeritemTemplates.templates[itemtype].compiledTemplate(item));
        
        if (offeritemTemplates.templates[itemtype].swiper) {

            var swiper = f7.swiper('.swiper-container', { 
                autoplay: 1600,
                speed: 1000,
                spaceBetween: 3,
                pagination: ".swiper-pagination", 
                autoplayDisableOnInteraction: true,
                autoplayStopOnLast: true
            });                                       
        }

     
         
        
        utility.bindEvents(f7.getCurrentView().activePage, bindings);
    }

    function renderToolbar(toolbarViewModel) {
        
                    
                    var $toolbar =  $$(f7.getCurrentView().activePage.container).find('.toolbar');
        
                    $toolbar.show();
                    $toolbar.html(offeritemTemplates.templates["toolbar"].compiledTemplate(toolbarViewModel));
        
                    utility.bindEvents(f7.getCurrentView().activePage, toolbarViewModel.bindings);
    }

    function renderError() {
        
        navbarContainer = f7.getCurrentView().activePage.navbarInnerContainer; 
        $$(navbarContainer).find('.center').html(constants.messages.error_no_connection_short);
        
        $$(f7.getCurrentView().activePage.container).find('.page-content').html(offeritemTemplates.templates["loaderror"].compiledTemplate());

    }
    
    
    module.exports = {

        render : render,
        renderError : renderError,
        renderToolbar : renderToolbar
        
    }
