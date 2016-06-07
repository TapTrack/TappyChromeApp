app.directive('ndefRecordEditor', ['$compile',function($compile) {
    return {
        restrict: 'E',
        //template: '<md-list-item flex ng-include="templateUrl" onload="wireupTemplate()"></md-list-item>',
        scope: {
            recordService: '=',
            recordIndex: '='
        },
        link: function(scope, element, attrs) {
            var template = ``;
            var ndefRecord = scope.ndefRecord; 
            var knownRecord = false;
            var icon = "/res/img/svg/ic_help_outline.svg";
            var customContent = "<div layout='row' flex layout-align='start center' class='md-subhead'><div style='font-style:italic; opacity: 0.54'>This tool doesn't support editing this record type</div></div>";
            if(ndefRecord.getTnf() === Ndef.Record.TNF_WELL_KNOWN) {
                if(ndefRecord.getType()[0] === 0x54) {
                    knownRecord = true;
                    icon = "/res/img/svg/ic_description.svg";
                    customContent = "<ndef-text-input record='ndefRecord' record-updated='onRecordUpdated' flex></ndef-text-input>"; 
                }
                if(ndefRecord.getType()[0] === 0x55) {
                    knownRecord = true;
                    icon = "/res/img/svg/ic_link.svg";
                    customContent = "<ndef-uri-input record='ndefRecord' split-initially='true' record-updated='onRecordUpdated' flex></ndef-uri-input>";
                }
            }
            if(!knownRecord) {
                console.log("Unknown record type");
            }
            template = `
                <div flex layout-padding layout='row'><md-icon md-svg-icon="`;
            template += icon;
            template += `">
                </md-icon>
                <div flex layout="row">`;
            template += customContent;
            template += ` 
                    <md-menu>
                        <md-button class="md-icon-button" ng-click="$mdOpenMenu($event)" style="margin-top:1em">
                            <md-icon md-svg-icon="/res/img/svg/ic_more_vert.svg"></md-icon>
                        </md-button>
                        <md-menu-content>
                            <md-menu-item ng-repeat="contentMenuAction in contentMenuActions">
                                <md-button ng-click="contentMenuAction.action()">
                                    {{ contentMenuAction.description }}
                                </md-button>
                            </md-menu-item>
                        </md-menu-content>
                    </md-menu>
                </div></div>`;
            element.html(template);
            $compile(element.contents())(scope);
        },
        controller: ['$scope','$element',function($scope,$element) {
            var totalRecords = $scope.recordService.getRecords();
            
            var ndefRecord;
            if(typeof $scope.ndefRecord == 'undefined') {
                ndefRecord = totalRecords[$scope.recordIndex];
                $scope.ndefRecord = ndefRecord; 
            }
            else {
                ndefRecord = $scope.ndefRecord;
            }
            
            $scope.contentMenuActions = [];

            if($scope.recordIndex !== 0) {
                $scope.contentMenuActions.push({
                    description: "Move Up",
                    action: function() {
                        $scope.recordService.swapIndex($scope.recordIndex,$scope.recordIndex - 1);
                    }
                });
            }
            
            if($scope.recordIndex < (totalRecords.length - 1)) {
                $scope.contentMenuActions.push({
                    description: "Move Down",
                    action: function() {
                        $scope.recordService.swapIndex($scope.recordIndex,$scope.recordIndex + 1);
                    }
                });
            }

            $scope.contentMenuActions.push({
                description: "Remove Record",
                action: function() {
                    $scope.recordService.deleteRecord($scope.recordIndex);
                }
            });

            $scope.idx = $scope.recordIdx;
            $scope.templateUrl = "";
            if(ndefRecord.getTnf() === Ndef.Record.TNF_WELL_KNOWN) {
                if(ndefRecord.getType()[0] === 0x54) {
                    $scope.contentMenuActions.push({
                        description: "Convert to URI",
                        action: function() {
                            var currentRecord = $scope.recordService.getRecords()[$scope.recordIndex];
                            var resolved = Ndef.Utils.resolveTextRecord(currentRecord);
                            var uriRecord = Ndef.Utils.createUriRecord(resolved.content);
                            $scope.recordService.updateRecord($scope.recordIndex,uriRecord);
                        }
                    });
                }
                if(ndefRecord.getType()[0] === 0x55) {
                    $scope.contentMenuActions.push({
                        description: "Convert to Text",
                        action: function() {
                            var currentRecord = $scope.recordService.getRecords()[$scope.recordIndex];
                            var uri = Ndef.Utils.resolveUriRecordToString(currentRecord);
                            var textRecord = Ndef.Utils.createTextRecord(uri,"en");
                            $scope.recordService.updateRecord($scope.recordIndex,textRecord);
                        }
                    });
                }
            }

            // this could be replaced with a watch, not sure why i did this
            $scope.onRecordUpdated = function(record) {
                $scope.recordService.updateRecord($scope.recordIndex,record,true);
            };
        }]
    };
}]);
