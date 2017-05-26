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

  const memberExpressionCheck = function (node, identifier, property) {
    if (node.object.type === 'MemberExpression') {
      return memberExpressionCheck(node.object, identifier, property);
    }
    return node.object.name.match(identifier)
            && (node.property.name === property
            || node.property.value === property);
  };

  const hasProperty = function (node, name) {
    return node.property.name === name;
  };

    // Curried
  const isOfType = function (type) {
    return function newCheck(node) {
      return type === node.type;
    };
  };

  const identifierUsedInReturn = function (identifier, node) {
    const isIdentifier = isOfType('Identifier');

    if (isIdentifier(node.argument)) {
      return node.argument.name === identifier;
    }
    return false;
  };

  const assignmentPointsTo = function (node, identifier) {
    const isIdentifier = isOfType('Identifier');

    if (isIdentifier(node.right)) {
      return node.right.name === identifier;
    }
    return false;
  };

  const declarationPointsTo = function (node, identifier) {
    const isIdentifier = isOfType('Identifier');

    if (isIdentifier(node.init)) {
      return node.init.name === identifier;
    }
    return false;
  };

  const findMemberExpression = function (node) {
    const isMemberExpression = isOfType('MemberExpression');

    if (isMemberExpression(node)) {
      return node;
    }
  };

  const findDeclaration = function (node) {
    const isDeclaration = isOfType('VariableDeclarator');

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
    isOfType,
    collectMemberExpressions,
    collectDeclarations,
    reduceBoolean,
  };
}());

module.exports = ASTManipulations;
