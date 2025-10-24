
var obfuscators = [];
var styleMap = {
    '\u00A74': 'font-weight:normal;text-decoration:none;color:#be0000',
    '\u00A7c': 'font-weight:normal;text-decoration:none;color:#fe3f3f',
    '\u00A76': 'font-weight:normal;text-decoration:none;color:#d9a334',
    '\u00A7e': 'font-weight:normal;text-decoration:none;color:#fefe3f',
    '\u00A72': 'font-weight:normal;text-decoration:none;color:#00be00',
    '\u00A7a': 'font-weight:normal;text-decoration:none;color:#3ffe3f',
    '\u00A7b': 'font-weight:normal;text-decoration:none;color:#3ffefe',
    '\u00A73': 'font-weight:normal;text-decoration:none;color:#00bebe',
    '\u00A71': 'font-weight:normal;text-decoration:none;color:#0000be',
    '\u00A79': 'font-weight:normal;text-decoration:none;color:#3f3ffe',
    '\u00A7d': 'font-weight:normal;text-decoration:none;color:#fe3ffe',
    '\u00A75': 'font-weight:normal;text-decoration:none;color:#be00be',
    '\u00A7f': 'font-weight:normal;text-decoration:none;color:#ffffff',
    '\u00A77': 'font-weight:normal;text-decoration:none;color:#bebebe',
    '\u00A78': 'font-weight:normal;text-decoration:none;color:#3f3f3f',
    '\u00A70': 'font-weight:normal;text-decoration:none;color:#000000',
    '\u00A7l': 'font-weight:bold',
    '\u00A7n': 'text-decoration:underline;text-decoration-skip:spaces',
    '\u00A7o': 'font-style:italic',
    '\u00A7m': 'text-decoration:line-through;text-decoration-skip:spaces',
};
function obfuscate(string, elem) {
    var magicSpan,
        currNode,
        len = elem.childNodes.length;
    if(string.indexOf('<br>') > -1) {
        elem.innerHTML = string;
        for(var j = 0; j < len; j++) {
            currNode = elem.childNodes[j];
            if(currNode.nodeType === 3) {
                magicSpan = document.createElement('span');
                magicSpan.innerHTML = currNode.nodeValue;
                elem.replaceChild(magicSpan, currNode);
                init(magicSpan);
            }
        }
    } else {
        init(elem, string);
    }
    function init(el, str) {
        var i = 0,
            obsStr = str || el.innerHTML,
            len = obsStr.length;
        obfuscators.push( window.setInterval(function () {
            if(i >= len) i = 0;
            obsStr = replaceRand(obsStr, i);
            el.innerHTML = obsStr;
            i++;
        }, 0) );
    }
    function randInt(min, max) {
        return Math.floor( Math.random() * (max - min + 1) ) + min;
    }
    function replaceRand(string, i) {
        var randChar = String.fromCharCode( randInt(64,90) ); /*Numbers: 48-57 Al:64-90*/
        return string.substr(0, i) + randChar + string.substr(i + 1, string.length);
    }
}
function applyCode(string, codes) {
    var len = codes.length;
    var elem = document.createElement('span'),
        obfuscated = false;
    for(var i = 0; i < len; i++) {
        elem.style.cssText += styleMap[codes[i]] + ';';
        if(codes[i] === '\u00A7k') {
            obfuscate(string, elem);
            obfuscated = true;
        }
    }
    if(!obfuscated) elem.innerHTML = string;
    return elem;
}
function parseStyle(string) {
    var codes = string.match(/\u00A7.{1}/g) || [],
        indexes = [],
        apply = [],
        tmpStr,
        indexDelta,
        noCode,
        final = document.createDocumentFragment(),
        len = codes.length,
        string = string.replace(/\n|\\n/g, '<br>');
    
    for(var i = 0; i < len; i++) {
        indexes.push( string.indexOf(codes[i]) );
        string = string.replace(codes[i], '\x00\x00');
    }
    if(indexes[0] !== 0) {
        final.appendChild( applyCode( string.substring(0, indexes[0]), [] ) );
    }
    for(var i = 0; i < len; i++) {
    	indexDelta = indexes[i + 1] - indexes[i];
        if(indexDelta === 2) {
            while(indexDelta === 2) {
                apply.push ( codes[i] );
                i++;
                indexDelta = indexes[i + 1] - indexes[i];
            }
            apply.push ( codes[i] );
        } else {
            apply.push( codes[i] );
        }
        if( apply.lastIndexOf('\u00A7r') > -1) {
            apply = apply.slice( apply.lastIndexOf('\u00A7r') + 1 );
        }
        tmpStr = string.substring( indexes[i], indexes[i + 1] );
        final.appendChild( applyCode(tmpStr, apply) );
    }
    return final;
}
function clearObfuscators() {
    var i = obfuscators.length;
    for(;i--;) {
        clearInterval(obfuscators[i]);
    }
    obfuscators = [];
}
String.prototype.replaceColorCodes = function() {
  clearObfuscators();
  var outputString = parseStyle(String(this));
  return outputString;
};

/////////////////////////////////////////////////
function cutString(str, cutStart, cutEnd){
  return str.substr(0,cutStart) + str.substr(cutEnd+1);
}