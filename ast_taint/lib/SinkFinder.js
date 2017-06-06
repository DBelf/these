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
  const functionSinks = ['eval', 'function', 'execScript'];
  const documentCallSinks = ['write', 'writeln'];
  const locationCallSinks = ['assign', 'replace'];

  class Sink {
    constructor(file, identifier, location) {
      this.file = file;
      this.identifier = identifier;
      this.location = location;
    }
  }

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


  const callsSink = function (filename, callExpression) {
    const isSink = functionSinks.reduce((acc, sink) => (
      acc || Utils.functionNameMatches(callExpression, sink)), false);
    return isSink ? new Sink(filename, callExpression.callee.name, callExpression.loc) : [];
  };

  // const checkMessagePayload = function (node) {
  //   const messageArguments = node.expression.arguments;
  //
  // }
  const checkCallExpression = function (filename, callExpression) {
    switch (callExpression.callee.name) {
      case 'document':
        return [];
      case 'location':
        return [];
      default:
        return callsSink(filename, callExpression);
    }
  };

  const declarationIsSink = function (filename, declaration) {
    const assignsToExpression = Utils.isCallExpression(declaration.init);
    return assignsToExpression ? callsSink(filename, declaration.init) : [];
  };

  const checkAssignmentExpression = function (filename, expression) {
    const assignsToExpression = Utils.isCallExpression(expression.right);
    return assignsToExpression ? callsSink(filename, expression.right) : [];
  };

  /**
   * Gets the array of declarations and checks whether any of these is
   * assigned to a sink.
   */
  const checkDeclaration = function (filename, declarationArray) {
    return declarationArray.reduce((acc, declaration) => (
      declarationIsSink(filename, declaration)), []);
  };

  return {
    checkCallExpression,
    checkDeclaration,
    checkAssignmentExpression,
  };
}());

module.exports = SinkFinder;
