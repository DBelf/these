/**
 * Created by dimitri on 03/05/2017.
 */

function test(id) {
    var field = document.getElementById(id).value;
    return field;
}

var input = document.getElementById("form").value;
var tmp = test(input);
var unsafe_sink = eval(tmp);

// window.addEventListener("message", function(event) {
//     if (event.source == window &&
//         event.data.direction &&
//         event.data.direction == "from-page-script") {
//         eval(event.data.message);
//     }
// });