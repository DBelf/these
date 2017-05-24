/**
 * Created by dimitri on 24/05/2017.
 */
var outerScopedVar = document.value;

function innerScope() {
    var innerScopedVar = document.value;
}