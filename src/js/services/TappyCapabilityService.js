app.factory('TappyCapabilityService',['TappyService',function(TappyService) {
    
    var topLevel = [
        {title: 'Detect', partial:'/res/partials/rwcontent.html', controllerName: 'ReadController'},
        {title: 'Write', partial:'/res/partials/rwcontent.html', controllerName: 'WriteController'},
        {title: 'Utilities', partial:'/res/partials/rwcontent.html', controllerName: 'BarredUtilityController'},
    ];

    var SideTab = function(icon, tooltip, partial, colorStroke) {
        this.icon = icon;
        this.tooltip = tooltip;
        this.partial = partial;
        this.colorStroke = colorStroke;
    };

    var clUtilityTabs = [];

    clUtilityTabs.push(new SideTab('/res/img/svg/ic_open_in_browser.svg','Launch URLs','/res/partials/openUrlUtilityItem.html',false));
    clUtilityTabs.push(new SideTab('/res/img/svg/ic_lock.svg','Lock tags','/res/partials/lockTagUtilityItem.html',false));
    clUtilityTabs.push(new SideTab('/res/img/svg/ic_cloud_upload.svg','Configure for TapTrack Platform','/res/partials/platformUploadUtilityItem.html',false));
    
    var tcUtilityTabs = [];
    
    //tcmp doesnt have a generic lock function
    tcUtilityTabs.push(new SideTab('/res/img/svg/ic_open_in_browser.svg','Launch URLs','/res/partials/openUrlUtilityItem.html',false));
    tcUtilityTabs.push(new SideTab('/res/img/svg/ic_cloud_upload.svg','Configure for TapTrack Platform','/res/partials/platformUploadUtilityItem.html',false));
    
    var writeTabs = [];
    writeTabs.push(new SideTab('/res/img/svg/ic_link.svg','Single URI record','/res/partials/writeUri.html',false));
    writeTabs.push(new SideTab('/res/img/svg/ic_description.svg','Single text record','/res/partials/writeText.html',false));
    writeTabs.push(new SideTab('/res/img/svg/ic_person.svg','Single vCard record','/res/partials/writeVcard.html',false));
    writeTabs.push(new SideTab('/res/img/svg/ic_list.svg','Multi-record message','/res/partials/writeMultiRecord.html',false));
    
    var clDetectTabs = [];
    clDetectTabs.push(new SideTab('/res/img/svg/ic_nmark_optimised.svg','Read NDEF tag','/res/partials/readNdef.html',false));
    clDetectTabs.push(new SideTab('/res/img/svg/ic_nfc.svg','Detect tag','/res/partials/scanTag.html',false));
    clDetectTabs.push(new SideTab('/res/img/svg/ic_typeb_opt.svg','Detect Type 4B tag','/res/partials/scanType4.html',true));
    
    var tcDetectTabs = [];
    tcDetectTabs.push(new SideTab('/res/img/svg/ic_nmark_optimised.svg','Read NDEF tag','/res/partials/readNdef.html',false));
    tcDetectTabs.push(new SideTab('/res/img/svg/ic_nfc.svg','Detect tag','/res/partials/scanTag.html',false));
    
    return {
        getMainCategories: function() {
            if(TappyService.getTappyType() === "none") {
                return [];
            } else {
                return topLevel;
            }
        },
        getUtilityTabs: function() {
           if(TappyService.getTappyType() === "tcmp") {
                return tcUtilityTabs;
            } else if(TappyService.getTappyType()  === "classic") {
                return clUtilityTabs;
            } else {
                return [];
            }
        },
        getWriteTabs: function() {
            if(TappyService.getTappyType() === "none") {
                return [];
            } else {
                return writeTabs;
            }
        },
        getDetectTabs: function() {
            if(TappyService.getTappyType() === "tcmp") {
                return tcDetectTabs;
            } else if(TappyService.getTappyType()  === "classic") {
                return clDetectTabs;
            } else {
                return [];
            }
        }
    };

}]);
