app.service('MultiRecordNdefService',['$rootScope',function($rootScope) {
    var self = this;
    this.changeCount = 0;
    var changeShadow = 0;
    var ndefRecords = [];

    // simple way to allow
    var notifyChange = function() {
        changeShadow++;
        // just in case some badly behaved controller
        // clobbers changes to changeCount
        $rootScope.$evalAsync(function() {
            self.changeCount = changeShadow;
        });
    };

    this.appendRecord = function(ndefRecord) {
        ndefRecords.push(ndefRecord);
        notifyChange();
    };

    this.getRecords = function() {
        return ndefRecords;
    };

    this.updateRecord = function(idx, ndefRecord, silent) {
        if(idx >= ndefRecords.length) {
            throw "Index out of bounds: ndef record not defined";
        }
        
        if(typeof silent === "undefined") {
            silent = false;
        }

        ndefRecords[idx] = ndefRecord;
        if(!silent) {
            notifyChange();
        }
    };

    this.deleteRecord = function(idx) {
        ndefRecords.splice(idx,1);
        notifyChange();
    };

    this.insertRecord = function(idx,record) {
        ndefRecords.splice(idx,0,record);
        notifyChange();
    };
    
    this.replaceAllRecords = function(newRecords) {
        ndefRecords = newRecords;
        notifyChange();
    };

    this.clearRecords = function() {
        ndefRecords = [];
        notifyChange();
    };

    this.swapIndex = function(idx1, idx2) {
        if(idx1 >= ndefRecords.length) {
            throw "Index 1 for swap out of bounds";
        }

        if(idx2 >= ndefRecords.length) {
            throw "Index 2 for swap out of bounds";
        }

        var temp = ndefRecords[idx1];
        ndefRecords[idx1] = ndefRecords[idx2];
        ndefRecords[idx2] = temp;
        notifyChange();
    };

}]);
