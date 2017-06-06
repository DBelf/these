/**
 * Created by dimitri on 29/05/2017.
 */
let cpmm = Cc["@mozilla.org/childprocessmessagemanager;1"].getService(Ci.nsISyncMessageSender);

cpmm.addMessageListener("message", function (message) {
  return message.value;
});