/**
 * Created by dimitri on 24/05/2017.
 */
var outerScopedVar = document.value;

function returnedScope() {
    var innerScopedVar = document.value;
    for (var i = 0; i < 2; i++){
        var nestedScopeVar = document.value;
    }
    return innerScopedVar;
}

var returnedTaint = returnedScope();