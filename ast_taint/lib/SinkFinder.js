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

  const callsSink = function (filename, callExpression) {
    const isSink = functionSinks.reduce((acc, sink) => (
      acc || Utils.functionNameMatches(callExpression, sink)), false);
    return isSink ? new Sink(filename, callExpression.callee.name, callExpression.loc) : [];
  };

  const accessesSink = function (filename, accessExpression) {
    switch (accessExpression.object.name) {
      default:
        return [];
    }
  };

  const expressionIsSink = function (filename, expression) {
    switch (expression.type) {
      case 'MemberExpression':
        return accessesSink(filename, expression);
      case 'CallExpression':
        return callsSink(filename, expression);
      default:
        return [];
    }
  };

  const declarationIsSink = function (filename, declaration) {
    const assignsToExpression = Utils.isCallExpression(declaration.init);
    return assignsToExpression ? expressionIsSink(filename, declaration.init) : [];
  };

  const checkAssignmentExpression = function (filename, expression) {
    const assignsToExpression = Utils.isCallExpression(expression.right);
    return assignsToExpression ? expressionIsSink(filename, expression.right) : [];
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
    expressionIsSink,
    checkDeclaration,
    checkAssignmentExpression,
  };
}());

module.exports = SinkFinder;
