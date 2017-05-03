/**
 * Created by dimitri on 03/05/2017.
 */

function test(bla) {
    var same_element = bla.value;

    return same_element;
}

var input = document.getElementById("form").value;
var tmp = test(input);
var breek = eval(tmp);