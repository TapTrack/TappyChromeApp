app.factory('TappyCapabilityService',[function() {
    
    var returnTopLevel = function(scope,controller) {
        var topLevel = [
            {title: 'Detect', partial:'/res/partials/rwcontent.html', controllerName: 'ReadController'},
            {title: 'Write', partial:'/res/partials/rwcontent.html', controllerName: 'WriteController'},
            {title: 'Utilities', partial:'/res/partials/rwcontent.html', controllerName: 'BarredUtilityController'},
        ];
        return topLevel;
    };

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
    
    var clWriteTabs = [];
    clWriteTabs.push(new SideTab('/res/img/svg/ic_link.svg','Single URI record','/res/partials/writeUri.html',false));
    clWriteTabs.push(new SideTab('/res/img/svg/ic_description.svg','Single text record','/res/partials/writeText.html',false));
    clWriteTabs.push(new SideTab('/res/img/svg/ic_person.svg','Single vCard record','/res/partials/writeVcard.html',false));
    clWriteTabs.push(new SideTab('/res/img/svg/ic_list.svg','Multi-record message','/res/partials/writeMultiRecord.html',false));
    
    var tcWriteTabs = [];
    tcWriteTabs.push(new SideTab('/res/img/svg/ic_link.svg','Single URI record','/res/partials/writeUri.html',false));
    tcWriteTabs.push(new SideTab('/res/img/svg/ic_description.svg','Single text record','/res/partials/writeText.html',false));
    tcWriteTabs.push(new SideTab('/res/img/svg/ic_list.svg','Multi-record message','/res/partials/writeMultiRecord.html',false));
    
    var clDetectTabs = [];
    clDetectTabs.push(new SideTab('/res/img/svg/ic_nmark_optimised.svg','Read NDEF tag','/res/partials/readNdef.html',false));
    clDetectTabs.push(new SideTab('/res/img/svg/ic_nfc.svg','Detect tag','/res/partials/scanTag.html',false));
    clDetectTabs.push(new SideTab('/res/img/svg/ic_typeb_opt.svg','Detect Type 4B tag','/res/partials/scanType4.html',true));
    
    var tcDetectTabs = [];
    tcDetectTabs.push(new SideTab('/res/img/svg/ic_nmark_optimised.svg','Read NDEF tag','/res/partials/readNdef.html',false));
    tcDetectTabs.push(new SideTab('/res/img/svg/ic_nfc.svg','Detect tag','/res/partials/scanTag.html',false));
    
    return {
        getMainCategories: returnTopLevel,
        getUtilityTabs: function() {
            if(BuildConfig.tappyType === "tcmp") {
                return tcUtilityTabs;
            } else {
                return clUtilityTabs;
            }
        },
        getWriteTabs: function() {
            if(BuildConfig.tappyType === "tcmp") {
                return tcWriteTabs;
            } else {
                return clWriteTabs;
            }
        },
        getDetectTabs: function() {
            if(BuildConfig.tappyType === "tcmp") {
                return tcDetectTabs;
            } else {
                return clDetectTabs;
            }
        }
    };

}]);
