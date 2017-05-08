/**
 * Created by dimitri on 03/05/2017.
 */

function funCall(id) {
    var field = document.getElementById(id).value;
    return field;
}

var locationTest = location;
var input = document.getElementById("form").value;
var tmp = funCall("string");
var unsafe_sink = eval(tmp + input);
