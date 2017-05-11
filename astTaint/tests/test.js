var non_dynamic = 1;
var not_good = eval("script");
var globalscope1 = document.getElementById(element).value;
var fromglobscope = globalscope1;

function insideFunction(variable){
    globalscope1 = 1;
    return variable;
}

var a = insideFunction(globalscope1);