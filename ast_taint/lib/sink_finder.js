/**
 * Created by dimitri on 15/05/2017.
 */
var astCheck = require('./utils');

var SinkFinder = (function () {

    const _BROADCAST_MESSAGE_STRING = 'broadcastMessage';
    const _SERVICES_STRING = 'Services';
    var _messages = ['sendAsyncMessage', 'sendSyncMessage'];
    var _messageManagers = ['@mozilla.org/childprocessmessagemanager;1',
        '@mozilla.org/parentprocessmessagemanager;1'];

    var communicationManagerCheck = function (node) {
        return true;
    }

    var findProcessMessageManager = function (node, parent) {
        var potentialManager = _messageManagers.map(function (propertyName) {
            return astCheck.memberExpressionCheck(node.init.callee, 'Cc', propertyName);
        });
        var foundManager = potentialManager.reduce(astCheck.reduceBoolean, false);

        if (foundManager) {
            return node.id.name;
        }
        return "";
    }

    var checkMessageFunction = function (node) {
        return true;
    }

    return {
        communicationManagerCheck: communicationManagerCheck,
        findProcessMessageManager: findProcessMessageManager,
        checkMessageFunction: checkMessageFunction
    }
})();

module.exports = SinkFinder;