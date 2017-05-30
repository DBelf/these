/**
 * Created by dimitri on 15/05/2017.
 */
const estraverse = require('estraverse');

const ASTManipulations = (function utilities() {
  const reduceBoolean = function (acc, val) {
    return acc || val;
  };

  const mapFunctionToNodes = function (ast, curryFunction) {
    const arr = [];
    estraverse.traverse(ast, {
      enter(node) {
        arr.push(curryFunction(node));
      },
    });
    return arr;
  };
  // Curried
  const isOfType = function (type) {
    return function newCheck(node) {
      return node !== null ? type === node.type : false;
    };
  };

  const isExpression = isOfType('AssignmentExpression');
  const isIdentifier = isOfType('Identifier');
  const isMemberExpression = isOfType('MemberExpression');
  const isDeclaration = isOfType('VariableDeclarator');

  const expressionHasIdentifier = function (node) {
    if (isExpression(node.expression)) {
      return isIdentifier(node.expression.right);
    } return false;
  };

  const memberExpressionCheck = function (node, identifier, property) {
    if (isMemberExpression(node.object.type)) {
      return memberExpressionCheck(node.object, identifier, property);
    }
    return node.object.name.match(identifier)
            && (node.property.name === property
            || node.property.value === property);
  };

  const hasProperty = function (node, name) {
    return node.property.name === name;
  };

  const identifierUsedInReturn = function (identifier, node) {
    if (isIdentifier(node.argument)) {
      return node.argument.name === identifier;
    }
    return false;
  };

  const assignmentPointsTo = function (node, identifier) {
    if (isIdentifier(node.right)) {
      return node.right.name === identifier;
    }
    return false;
  };

  const declarationPointsTo = function (node, identifier) {
    if (isIdentifier(node.init)) {
      return node.init.name === identifier;
    }
    return false;
  };

  // Everything below this point is bogus?
  const findMemberExpression = function (node) {
    if (isMemberExpression(node)) {
      return node;
    }
  };

  const findDeclaration = function (node) {
    if (isDeclaration(node)) {
      return node;
    }
  };

  const collectDeclarations = function (ast) {
    const declarations = mapFunctionToNodes(ast, findDeclaration);
    return declarations.filter(node => node);
  };

  const collectMemberExpressions = function (ast) {
    const memberExpressions = mapFunctionToNodes(ast, findMemberExpression);
    return memberExpressions.filter(node => node);// Not sure of this filter
  };

  return {
    memberExpressionCheck,
    identifierUsedInReturn,
    declarationPointsTo,
    assignmentPointsTo,
    findDeclaration,
    hasProperty,
    mapFunctionToNodes,
    isExpression,
    isIdentifier,
    isMemberExpression,
    isDeclaration,
    collectMemberExpressions,
    collectDeclarations,
    reduceBoolean,
  };
}());

module.exports = ASTManipulations;
