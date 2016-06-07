var StringUtils = function() {
    throw "Do not instantiate me!";
};

/**
 * Utility function for converting a Uint8Array 
 * into a hex string
 *
 * @param {Uint8Array} binary representation
 * @return {string} string hex 
 */
StringUtils.uint8ArrayToHexString = function(data) {
    var hexString = "";
    for(var x = 0; x < data.length; x++) {
        var hexValue = data[x].toString(16).toUpperCase();
        if(data[x] <= 15) {
            // gives zero padding to hex values less than 16
            hexString = hexString.concat("0" + hexValue);
        }
        else {
            hexString = hexString.concat(hexValue);
        }
    }
    return hexString;
};

/**
 * Utility function for converting a string
 * into a Uint8Array 
 *
 * @param {string} string record contents
 * @return {Uint8Array} binary representation
 */
StringUtils.stringToUint8Array = function(string) {
    var escstr = encodeURIComponent(string);
    var binstr = escstr.replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode('0x' + p1);
    });
    var ua = new Uint8Array(binstr.length);
    Array.prototype.forEach.call(binstr, function (ch, i) {
        ua[i] = ch.charCodeAt(0);
    });
    return ua;
};

/**
 * Utility function for converting a Uint8Array 
 * into a string
 *
 * @param {Uint8Array} binary representation
 * @return {string} string record contents
 */
StringUtils.uint8ArrayToString = function(arr) {
    var binstr = Array.prototype.map.call(arr, function (ch) {
        return String.fromCharCode(ch);
    }).join('');

    var escstr = binstr.replace(/(.)/g, function (m, p) {
        var code = p.charCodeAt(0).toString(16).toUpperCase();
        if (code.length < 2) {
            code = '0' + code;
        }
        return '%' + code;
    });
    return decodeURIComponent(escstr);    
};
