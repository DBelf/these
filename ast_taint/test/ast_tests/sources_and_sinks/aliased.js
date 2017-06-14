/**
 * Created by Dimitri on 14-6-2017.
 */

var globalSource = document.value;

function returnsAlias() {
  var scopedReassign = globalSource;
  return scopedReassign;
}

eval(globalSource);