/**
 * Created by dimitri on 15/05/2017.
 */
const BROADCAST_MESSAGE_STRING = 'broadcastMessage';
const SERVICES_STRING = 'Services';
var messages = ['sendAsyncMessage', 'sendSyncMessage'];
var messageManagers = ['@mozilla.org/childprocessmessagemanager;1',
    '@mozilla.org/parentprocessmessagemanager;1'];

var astCheck = require('./ast_manipulations');

exports.communicationManagerCheck = function (node) {
    return true;
}

exports.findChildProcessMessageManager = function (node) {
    var potentialManager = messageManagers.map(function(propertyName){
        return astCheck.memberExpressionCheck(node.init.callee, 'Cc', propertyName);
    });
    var foundManager = potentialManager.reduce(function (acc, val){
        return acc || val;
    }, false);
    if(foundManager){
        return node.id.name;
    }
    return "";
}