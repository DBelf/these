/**
 * Created by dimitri on 26/05/2017.
 */

var array = [1,2,3];

array.forEach(element => returnsSource(element));

function returnsSource(documentElement) {
  let source = documentElement.value;
  return source;
}
