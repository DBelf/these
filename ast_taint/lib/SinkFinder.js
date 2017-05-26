/**
 * Created by dimitri on 15/05/2017.
 */
var astCheck = require('./Utils');

var SinkFinder = (function () {

    const _BROADCAST_MESSAGE_STRING = 'broadcastMessage';
    const _SERVICES_STRING = 'Services';
    var _messages = ['sendAsyncMessage', 'sendSyncMessage'];
    var _servicesProperties = ['cpmm', 'ppm'];
    var _messageManagers = ['@mozilla.org/childprocessmessagemanager;1',
        '@mozilla.org/parentprocessmessagemanager;1', '@mozilla.org/globalmessagemanager;1'];

    var componentClassCheck = function (node) {
        var potentialManager = _messageManagers.map(function (propertyName) {
            return astCheck.memberExpressionCheck(node.init.callee, '', propertyName);
        });
        return potentialManager.reduce(astCheck.reduceBoolean, false);
    }

    //TODO finish this, not even sure if this is needed
    var servicesCheck = function (node, servicesAliases) {
        var services = servicesAliases.concat(_SERVICES_STRING);
        for (var i = 0; i < services; i++) {
            _servicesProperties.map(function (propertyName) {
                return astCheck.memberExpressionCheck(node.init.callee, '', propertyName);
            });
        }
    }

    var sinkMessage = function (node) {
        var potentialSink = _messages.map(function (messageType) {
            return astCheck.memberExpressionCheck(node, '', messageType);
        });
        return potentialSink.reduce(astCheck.reduceBoolean, false);
    }

    var findProcessMessageManager = function (node, parent) {
        var foundManager = componentClassCheck(node);
        if (foundManager) {
            return node.id.name;
        }
        return "";
    }

    var checkMessageFunction = function (node) {
        return true;
    }

    return {
        communicationManagerCheck: componentClassCheck,
        findProcessMessageManager: findProcessMessageManager,
        checkMessageFunction: checkMessageFunction
    }
})();

module.exports = SinkFinder;