app.service('WriteModeService',[function() {
    
    var modeWrite = {
        continuous: false,
        locks: false,
        description: "Write Tag"
    };
    var modeMultiWrite = {
        continuous: true,
        locks: false,
        description: "Write Multiple Tags"
    };
    var modeWriteLock = {
        continuous: false,
        locks: true,
        description: "Write and Lock Tag"
    };
    var modeMultiWriteLock = {
        continuous: true,
        locks: true,
        description: "Write and Lock Multiple Tags"
    };

    this.getDefaultMode = function() {
        return modeWrite;
    };

    this.getModes = function() {
        return [modeWrite,modeMultiWrite,modeWriteLock,modeMultiWriteLock];
    };
}]);
