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

  // Breaks on arrowexpressions
  const getScopeBody = function (scope) {
    switch (scope.block.type) {
      case 'FunctionDeclaration':
        return [].concat(scope.block.body.body);
      default:
        return [].concat(scope.block.body);
    }
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

  const filterSourceVariables = function (scope) {
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
    return filterSourceVariables(currentScope);
  };


  const getScopeParameters = function (scope) {
    return scope.block.params;
  };

  const analyzeScope = function (scope) {

    return filterSourceVariables(scope);
    // Takes a scope and checks whether it is vulnerable.
  };

  // TODO make this do the full test?
  const analyzeGlobalScope = function (scope) {
    const body = getScopeBody(scope);
    const sources = filterSourceVariables(scope);

    return true;
  };

  const analyzeFunction = function (scope) {
    const body = getScopeBody(scope);
    const sources = filterSourceVariables(scope);
    sources;
  };

  const checkParams = function (params) {
    return params.filter(parameter => (parameter.object !== undefined ?
        SourceFinder.generalCheck(parameter) : false));
  };

  const analyzeArrowFunction = function (scope) {
    const body = getScopeBody(scope);
    // check the parameters of the arrowfunction on whether they are sources
    const parameterSources = checkParams(getScopeParameters(scope));
    const sources = filterSourceVariables(scope);
    const sourceExpressions = body.filter(statement => SourceFinder.generalCheck(statement));
    console.log(sourceExpressions);
  };

  const expressionAlias = function (node, identifier) {
    const expression = node.expression;
    return Utils.assignmentPointsTo(expression, identifier) ? expression.left.name : '';
  };

  const declarationAlias = function (node, identifier) {
    const declarations = node.declarations.filter((declaration) => {
      if (declaration.type !== null) {
        return Utils.declarationPointsTo(declaration, identifier);
      } return false;
    });

    return declarations.reduce((acc, declaration) => acc.concat(declaration.id.name), []);
  };

// Not sure whether this works for nested forloops.
  const pointsToInScopeBody = function (identifier, scopeBody) {
    let uses = [];
    scopeBody.forEach((element) => {
      switch (element.type) {
        case 'VariableDeclaration':
          uses = uses.concat(declarationAlias(element, identifier));
          break;
        case 'ExpressionStatement':
          uses = uses.concat(expressionAlias(element, identifier));
          break;
        default:
          break;
      }
    });
    return uses.filter(n => n !== '');
  };

  const aliasInScope = function (identifier, scope) {
    const scopeBody = getScopeBody(scope);
    return pointsToInScopeBody(identifier, scopeBody);
  };

  const findPointsTo = function (sourceArr, scope) {
    return sourceArr.reduce((acc, alias) => acc.concat(aliasInScope(alias, scope)), []);
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
    let sourcesInFunction = filterSourceVariables(scope);
    const returnsInFunction = findReturnsInScope(scope);
    sourcesInFunction = sourcesInFunction.concat(findPointsTo(sourcesInFunction, scope));
    const returnsSource = returnsInFunction.map((returnStatement) => {
      const pointsToSource = returnPointsToSources(sourcesInFunction, returnStatement);
      return pointsToSource;
    });
    return returnsSource.reduce(Utils.reduceBoolean, false);
  };

  /**
   * Checks whether the sources are used in a child scope.
   */
  const findNestedSources = function checkChildScope(scope, identifiers = []) {
    // const newSources =
    const aliasesInScope = identifiers.reduce((acc, identifier) => (
      acc.concat(aliasInScope(identifier, scope))), identifiers);
    if (scope.childScopes.length < 1) {
      // All accumulated identifiers on the current scope level are checked
      return aliasesInScope;
    }
    return scope.childScopes.reduce((acc, childScope) => (
      acc.concat(checkChildScope(childScope, aliasesInScope))), []);
  };

  const sourcesInFile = function (ast) {
    const scopeManager = createScope(ast);
    const scopes = scopeManager.scopes;
    // Check whether variables are sources
    // Check whether Functions return sources

    // Check arrowFunctions
    // ??
    const sourceVariables = scopes.reduce((acc, scope) => (
      acc.concat(filterSourceVariables(scope))), []);
    const functionSources = scopes.filter((scope) => {
      const functionReturns = (scope.type === 'function') ? functionReturnsSource(scope) : false;
      return functionReturns;
    });
    console.log(functionSources.map(functionScope => functionScope.block.id.name));
    return sourceVariables.filter(n => n !== '');
  };

  const ast = GenerateAST.astFromFile('../test/ast_tests/scoped_sources.js');
  const currentScope = createScope(ast).scopes[0];
  // console.log(currentScope);
  const sourceArr = filterSourceVariables(currentScope);
  console.log(findNestedSources(currentScope, sourceArr));
  // console.log(findAllAliases(sourceArr, currentScope));

  return {
    sourcesInGlobalScope,
    sourcesInFile,
    functionReturnsSource,
    createScope,
  };
}());

// TODO Recursive check over all child scopes??
module.exports = Scope;
