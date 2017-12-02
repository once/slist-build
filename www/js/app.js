
var f7 = require('f7'),
    template_helpers = require('templates/template_helpers'),
    deviceutils = require('deviceutils'),
    constants = require('config/constants'),
    appConfig = require('config/appconfig'),
    storage = require('services/storage'),
    leftnav = require('modules/navigation/leftnav'),
    push = require('services/push'),
    analytics = require('services/ga_analytics'),
    version = require('services/version'),
    ads = require('services/ads');

               
        var mainView = f7.addView('.view-main', {
            
            dynamicNavbar: true,
            swipeBackPage: false,
            domCache: true
        });

        window.$$ = Dom7;

       
        var appMain = {

                initialize: function() {

                        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
                        document.addEventListener('pause', this.onPause.bind(this), false);
                        document.addEventListener('resume', this.onResume.bind(this), false);

                },

                onDeviceReady: function() {
                
                        // these actions are performed, while Splash screen is displayed....
                        
                                appConfig.load();

                                push.init(); // OneSignal Push Notification service init
                                analytics.init();  // Init Google Analytics Plugin

                                deviceutils.bindHardwareButtonHandlers();
                                
                                leftnav.init();

                                if (storage.ShouldUpdateDataFromServer()) storage.CleanLocalStorageData();

                                this.syncCodePush();    // update www-contents if available                  
                                
                                this.bindControllers(); 
                                
                                f7.init();
                                
                                saveAppFirstLaunchTimestamp();

                                ads.init();


                        // then we hide Splash Screen

                                deviceutils.hideSplashScreen();
                            
                                version.checkUpdate();

                        
                },

                
                onResume : function() {

                  
                        ads.showInterstitialIfAppropriate(); 

                        this.syncCodePush();    // update www-contents if available
                
                },

                onPause : function() {

                        
                        // warning! on iOS any code, placed into this handler, which calls ANY CORDOVA PLUGiNS, will be executed only after Resume event !!!!
                     

                },


                bindControllers: function () {


                    var moduleControllers = {
                        "offers" : require("modules/list/offerlistController"),
                        "index" : require("modules/list/offerlistController"),
                        "offer_item" : require("modules/offer/offeritemController"),
                        "about" : require("modules/about/aboutController"),
                        "complain" : require("modules/complain/complainController"),
                        "complain_form" : require("modules/complain/complainFormController"),
                        "settings" : require("modules/settings/settings"),
                        "developer" : require("modules/developer/developer"),
                        "shoppinglist" : require("modules/shoppinglist/shoppinglistController"),
                        "simpleitem" : require("modules/shoppinglist/simpleitemController"),

                    };

                        
                    for (pageName in moduleControllers) {

                        f7.onPageInit(pageName, function(page) { 

                               moduleControllers[page.name].init(page);
                               
                        });
                        
                    }

                    f7.onPageReinit("shoppinglist", function(page) {            
                        
                                                       require('modules/shoppinglist/shoppinglistController').reInit(page);
                                                
                                             });

                },

                syncCodePush: function() {

                                if (typeof window.codePush != "undefined") {

                                     window.codePush.sync(
                            
                                            function (syncStatus) {
                                                switch (syncStatus) {
                                                    // Result (final) statuses
                                                    case SyncStatus.UPDATE_INSTALLED:
                                                        console.log("The update was installed successfully. For InstallMode.ON_NEXT_RESTART, the changes will be visible after application restart. ");
                                                        break;
                                                    case SyncStatus.UP_TO_DATE:
                                                        console.log("The application is up to date.");
                                                        break;
                                                    case SyncStatus.UPDATE_IGNORED:
                                                        console.log("The user decided not to install the optional update.");
                                                        break;
                                                    case SyncStatus.ERROR:
                                                        console.log("An error occured while checking for updates");
                                                        break;
                                                    
                                                    // Intermediate (non final) statuses
                                                    case SyncStatus.CHECKING_FOR_UPDATE:
                                                        console.log("Checking for update.");
                                                        break;
                                                    case SyncStatus.AWAITING_USER_ACTION:
                                                        console.log("Alerting user.");
                                                        break;
                                                    case SyncStatus.DOWNLOADING_PACKAGE:
                                                        console.log("Downloading package.");
                                                        break;
                                                    case SyncStatus.INSTALLING_UPDATE:
                                                        console.log("Installing update");
                                                        break;
                                                }
                                            },
                                            {
                                                installMode: InstallMode.ON_NEXT_RESTART
                                            },
                                            function (downloadProgress) {
                                                console.log("Downloading " + downloadProgress.receivedBytes + " of " + downloadProgress.totalBytes + " bytes.");
                                            }
                                    );

                                }
                                else {
                                    console.log ("Problem with codePush: window.codePush is undefined!");
                                }
                }

    };

  

    function saveAppFirstLaunchTimestamp() {
        
        var existingTimestamp = appConfig.get(constants.storage.app_first_launch_timestamp);
        
        if ((existingTimestamp) && (existingTimestamp > 0)) return;

        appConfig.set(constants.storage.app_first_launch_timestamp, Date.now());

    }



module.exports =  {
	
		mainView: mainView,
		appMain : appMain
};




      


    
    