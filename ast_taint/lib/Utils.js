/**
 * Created by dimitri on 15/05/2017.
 */
const estraverse = require('estraverse');

const ASTManipulations = (function utilities() {
  const reduceBoolean = function (acc, val) {
    return acc || val;
  };

  // Curried
  const isOfType = function (type) {
    return function newCheck(node) {
      return node !== null ? type === node.type : false;
    };
  };

  const isProgram = isOfType('Program');
  const isExpression = isOfType('ExpressionStatement');
  const isAssignment = isOfType('AssignmentExpression');
  const isIdentifier = isOfType('Identifier');
  const isMemberExpression = isOfType('MemberExpression');
  const isDeclaration = isOfType('VariableDeclaration');
  const isReturn = isOfType('ReturnStatement');
  const isCallExpression = isOfType('CallExpression');

  const expressionHasIdentifier = function (node) {
    if (isExpression(node)) {
      if (isAssignment(node.expression)) {
        return isIdentifier(node.expression.right);
      }
    }
    return false;
  };

  const callsIdentifier = function (node) {
    return node.arguments.reduce((acc, argument) => {
      switch (argument.type) {
        case 'CallExpression':
          return isIdentifier(argument.callee);
        default:
          return false;
      }
    }, false);
  };

  const callExpressionWithIdentifier = function (node) {
    if (isExpression(node)) {
      if (isCallExpression(node.expression)) {
        return node.expression.arguments !== undefined ? callsIdentifier(node.expression) : false;
      }
    }
    return false;
  };

  const memberExpressionCheck = function (node, identifier, property) {
    if (isMemberExpression(node.object.type)) {
      return memberExpressionCheck(node.object, identifier, property);
    }
    return node.object.name.match(identifier)
            && (node.property.name === property
            || node.property.value === property);
  };

  const returnsIdentifier = function (node) {
    return isIdentifier(node.argument);
  };

  const hasProperty = function (node, name) {
    return isIdentifier(node.property) ? node.property.name === name : false;
  };

  const identifierUsedInReturn = function (identifier, node) {
    if (isIdentifier(node.argument)) {
      return node.argument.name === identifier;
    }
    return false;
  };

  const isDeclaredAssignment = function (node) {
    if (node.init !== null) {
      return isIdentifier(node.init);
    }
    return false;
  };

  const assignmentDeclarations = function (declarationNode) {
    return declarationNode.declarations.filter(declaration => isDeclaredAssignment(declaration));
  };

  const assignmentPointsTo = function (node, identifier) {
    if (isIdentifier(node.right)) {
      return node.right.name === identifier;
    }
    return false;
  };

  const calleeIdentifierMatches = function (callee, identifier) {
    if (isIdentifier(callee.callee)) {
      return callee.callee.name === identifier;
    } return false;
  };

  const declarationCalls = function (node, identifier) {
    if (isCallExpression(node.init)) {
      return calleeIdentifierMatches(node.init, identifier);
    }
    return false;
  };

  const assignmentCalls = function (node, identifier) {
    if (node.right !== undefined) {
      if (isCallExpression(node.right)) {
        return calleeIdentifierMatches(node.right, identifier);
      }
    }
    return false;
  };

  const declarationPointsTo = function (node, identifier) {
    if (isIdentifier(node.init)) {
      return node.init.name === identifier;
    }
    return false;
  };

  return {
    memberExpressionCheck,
    identifierUsedInReturn,
    declarationPointsTo,
    declarationCalls,
    assignmentPointsTo,
    assignmentCalls,
    hasProperty,
    isProgram,
    isReturn,
    isExpression,
    isIdentifier,
    isMemberExpression,
    isDeclaration,
    expressionHasIdentifier,
    callExpressionWithIdentifier,
    returnsIdentifier,
    assignmentDeclarations,
    reduceBoolean,
  };
}());

module.exports = ASTManipulations;
