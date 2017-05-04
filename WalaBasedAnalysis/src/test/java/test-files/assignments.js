/**
 * Created by dimitri on 03/05/2017.
 */

function test(id) {
    var field = document.getElementById(id).value;
    return field;
}

var input = document.getElementById("form").value;
var tmp = test("id");
var unsafe_sink = eval(tmp + input);
