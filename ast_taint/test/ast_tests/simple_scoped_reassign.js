/**
 * Created by dimitri on 24/05/2017.
 */
var globalSource = document.value;

var globalReassign = globalSource;

function returnsAlias() {
    var scopedReassign = globalSource;
    return scopedReassign;
}