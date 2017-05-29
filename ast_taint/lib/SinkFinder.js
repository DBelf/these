/**
 * Created by dimitri on 15/05/2017.
 */
const Utils = require('./Utils');

const SinkFinder = (function sinkFinder() {
  const BROADCAST_MESSAGE_STRING = 'broadcastMessage';
  const SERVICES_STRING = 'Services';
  const messages = ['sendAsyncMessage', 'sendSyncMessage'];
  const servicesProperties = ['cpmm', 'ppm'];
  const messageManagers = ['@mozilla.org/childprocessmessagemanager;1',
    '@mozilla.org/parentprocessmessagemanager;1', '@mozilla.org/globalmessagemanager;1'];


  const componentClassCheck = function (node) {
    const potentialManager = messageManagers.map(propertyName => Utils.memberExpressionCheck(node.init.callee, '', propertyName));
    return potentialManager.reduce(Utils.reduceBoolean, false);
  };

  // TODO finish this, not even sure if this is needed
  const servicesCheck = function (node, servicesAliases) {
    const services = servicesAliases.concat(SERVICES_STRING);
    for (let i = 0; i < services; i++) {
      servicesProperties.map(propertyName => Utils.memberExpressionCheck(node.init.callee, '', propertyName));
    }
  };

  const sinkMessage = function (node) {
    const potentialSink = messages.map(messageType => Utils.memberExpressionCheck(node, '', messageType));
    return potentialSink.reduce(Utils.reduceBoolean, false);
  };

  // const checkMessagePayload = function (node) {
  //   const messageArguments = node.expression.arguments;
  //
  // }

  const checkMessageFunction = function (node) {
    return true;
  };

  return {
    communicationManagerCheck: componentClassCheck,
    findProcessMessageManager,
    checkMessageFunction,
  };
}());

module.exports = SinkFinder;
