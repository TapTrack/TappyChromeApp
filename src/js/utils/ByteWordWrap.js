var ByteWordWrap = function() {
    throw "Do not instantiate me!";
};

ByteWordWrap.insertBreakPoints = function(byteString) {
    var output = "";
    for(var i = 0; i < byteString.length; i++) {
        if(i%2 === 0) {
            output += '\u200B';
        }
        output += byteString[i];
    }
    return output;
};

