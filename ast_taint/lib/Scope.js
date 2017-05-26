/**
 * Created by dimitri on 18/05/2017.
 */

const GenerateAST = require('./GenerateAST');
const Utils = require('./Utils');
const SourceFinder = require('./SourceFinder');
const escope = require('escope');

const Scope = (function scoping() {
  const createScope = function (ast) {
    const scopeManager = escope.analyze(ast);
    return scopeManager;
  };
  // Returns the identifier of a source, or nothing if the node isn't a source.
  const sourceId = function (node) {
    return SourceFinder.checkDeclaration(node) ? node.id.name : '';
  };

  // Dispatch and switch on the type???
  const checkDefsForSources = function (definition) {
    const defNode = definition[0].node;
    const isVariableDeclarator = Utils.isOfType('VariableDeclarator');
    return isVariableDeclarator(defNode) ? sourceId(defNode) : '';
  };

  const sourcesInScope = function (scope) {
    // Filter the arguments passed, when it is a function.
    const variablesInScope = scope.variables.filter(variable => variable.name !== 'arguments');
    const sources = variablesInScope.reduce((acc, variable) => {
      const arr = acc.concat(checkDefsForSources(variable.defs));
      return arr;
    }, []);
    return sources.filter(n => n !== '');
  };

  const sourcesInGlobalScope = function (ast) {
    const scopeManager = createScope(ast);
    const currentScope = scopeManager.acquire(ast);
    return sourcesInScope(currentScope);
  };

  const sourcesInFile = function (ast) {
    const scopeManager = createScope(ast);
    const scopes = scopeManager.scopes;

    const sources = scopes.reduce((acc, scope) => acc.concat(sourcesInScope(scope)), []);
    return sources.filter(n => n !== '');
  };

  //Breaks on arrowexpressions
  const getScopeBody = function (scope) {
    switch (scope.block.type) {
      case 'FunctionDeclaration':
        return [].concat(scope.block.body.body);
      default:
        return [].concat(scope.block.body);
    }
  };

  const expressionAlias = function (node, identifier) {
    const expression = node.expression;
    return Utils.assignmentPointsTo(expression, identifier) ? expression.left.name : '';
  };

  const declarationAlias = function (node, identifier) {
    let aliases = [];
    const declarations = node.declarations.filter((declaration) => {
      if (declaration !== null) {
        return Utils.declarationPointsTo(declaration, identifier);
      } return false;
    });
    aliases = aliases.concat(declarations.map(declaration => declaration.id.name));
    return aliases;
  };

// Not sure whether this works for nested forloops.
  const pointsToInScopeBody = function (identifier, scopeBody) {
    let uses = [];
    scopeBody.forEach((body) => {
      switch (body.type) {
        case 'VariableDeclaration':
          uses = uses.concat(declarationAlias(body, identifier));
          break;
        case 'ExpressionStatement':
          uses = uses.concat(expressionAlias(body, identifier));
          break;
        default:
          break;
      }
    });
    return uses.filter(n => n !== '');
  };

  const pointsToInScope = function (identifier, scope) {
    const scopeBody = getScopeBody(scope);
    return pointsToInScopeBody(identifier, scopeBody);
  };

  const findAllAliases = function (sourceArr, scope) {
    return sourceArr.filter(alias => pointsToInScope(alias, scope));
  };

  const findReturnsInScope = function (scope) {
    return getScopeBody(scope).filter(statement => statement.type === 'ReturnStatement');
  };

  const returnPointsToSources = function (sources, returnStatement) {
    const returnsSource = sources.reduce((acc, source) => {
      const value = acc || Utils.identifierUsedInReturn(source, returnStatement);
      return value;
    }, false);
    return returnsSource;
  };

  const functionReturnsSource = function (scope) {
    let sourcesInFunction = sourcesInScope(scope);
    const returnsInFunction = findReturnsInScope(scope);
    sourcesInFunction = sourcesInFunction.concat(findAllAliases(sourcesInFunction, scope));
    const returnsSource = returnsInFunction.map((returnStatement) => {
      const pointsToSource = returnPointsToSources(sourcesInFunction, returnStatement);
      return pointsToSource;
    });
    return returnsSource.reduce(Utils.reduceBoolean, false);
  };

  // const ast = GenerateAST.astFromFile('../test/ast_tests/function_returns_source.js');
  // const currentScope = createScope(ast).scopes[1];
  // console.log(getScopeBody(currentScope));

  return {
    sourcesInGlobalScope,
    sourcesInFile,
    functionReturnsSource,
    createScope,
  };
}());

// TODO Recursive check over all child scopes??
module.exports = Scope;
