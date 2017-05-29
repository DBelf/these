/**
 * Created by dimitri on 29/05/2017.
 */
window.addEventListener("message", function(event) {
  if (event.source == window &&
    event.data.direction &&
    event.data.direction == "from-page-script") {
    eval(event.data.message);
  }
});

// window.sendAsyncMessage('name', {'payload': true});
// void sendAsyncMessage([optional] in AString messageName,
// [optional] in jsval obj,
// [optional] in jsval objects,
// [optional] in nsIPrincipal principal);