/**
 * Created by dimitri on 29/05/2017.
 */
let cpmm = Cc["@mozilla.org/childprocessmessagemanager;1"].getService(Ci.nsISyncMessageSender);

function declared(source) {
  return source.value;
}

cpmm.addMessageListener("message", declared(message));