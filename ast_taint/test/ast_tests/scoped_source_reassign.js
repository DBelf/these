/**
 * Created by Dimitri on 23-5-2017.
 */

var inScope = document.value;
var shouldNotappear = 3;
var reassign;
reassign = inScope;

var otherReassign = reassign;//Is not found yet?

function name() {
    var scopedReassign = inScope;
}

var outOfScope = scopedReassign;