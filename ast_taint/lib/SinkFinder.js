/**
 * Created by dimitri on 15/05/2017.
 */
const Utils = require('./Utils');

const SinkFinder = (function sinkFinder() {
  const BROADCAST_MESSAGE_STRING = 'broadcastMessage';
  const SERVICES_STRING = 'Services';
  const messages = ['sendAsyncMessage', 'sendSyncMessage', 'postMessage', 'sendMessage'];
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

  // Rethink this structure.
  class CommunicationSink extends Sink {
    constructor(file, identifier, location, args) {
      super(file, identifier, location);
      this.args = args;
    }

    argumentIsSource(sourcesInScope) {
      sourcesInScope.reduce((acc, source) => source.isUsedIn(this.args));
    }
  }

  const documentSink = function (filename, callExpression) {
    return documentCallSinks.reduce((acc, sink) => (
    acc || Utils.hasProperty(callExpression, sink)), false) ?
      new Sink(filename, 'document', callExpression.loc) : [];
  };

  const locationSink = function (filename, callExpression) {
    return locationCallSinks.reduce((acc, sink) => (
    acc || Utils.hasProperty(callExpression, sink)), false) ?
      new Sink(filename, 'document', callExpression.loc) : [];
  };

  const callsSink = function (filename, callExpression) {
    return functionSinks.reduce((acc, sink) => (
    acc || Utils.functionNameMatches(callExpression, sink)), false) ?
      new Sink(filename, callExpression.callee.name, callExpression.loc) : [];
  };

  const messageSink = function (filename, expression) {
    const isMessageSink = messages.reduce((acc, message) => (
    acc || Utils.hasProperty(expression.callee, message)), false);
    return isMessageSink ? new CommunicationSink(
        filename, expression.callee.property.name, expression.loc, expression.arguments) : [];
  };

  const accessesSink = function (filename, accessExpression) {
    switch (accessExpression.callee.object.name) {
      case 'document':
        return documentSink(filename, accessExpression.callee);
      case 'location':
        return locationSink(filename, accessExpression.callee);
      default:
        return messageSink(filename, accessExpression);
    }
  };

  const expressionIsSink = function (filename, expression) {
    switch (expression.callee.type) {
      case 'MemberExpression':
        return accessesSink(filename, expression);
      case 'Identifier':
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
      acc.concat(declarationIsSink(filename, declaration))), []);
  };

  return {
    expressionIsSink,
    checkDeclaration,
    checkAssignmentExpression,
  };
}());

module.exports = SinkFinder;
