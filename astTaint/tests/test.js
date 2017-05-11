
function readElement (element, bla){
    var funscope = document.getElementById(element).value;
    return funscope;
}

var globalscope1 = readElement("test");
var globalscope2 = bla;