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
    return SourceFinder.checkDeclaration(node) ? node.id.name : null;
  };

  // Dispatch and switch on the type???
  const checkDefsForSources = function (definition) {
    const defNode = definition[0].node;
    const isVariableDeclarator = Utils.isOfType('VariableDeclarator');
    return isVariableDeclarator(defNode) ?
      SourceFinder.DECLARED_SOURCE(sourceId(defNode), 'VariableDeclarator', defNode.loc) : '';
  };

  const filterSourceVariables = function (scope) {
    // Filter the arguments passed, when it is a function.
    const variablesInScope = scope.variables.filter(variable => variable.name !== 'arguments');
    const sources = variablesInScope.reduce((acc, variable) => {
      const arr = acc.concat(checkDefsForSources(variable.defs));
      return arr;
    }, []);
    return sources.filter(n => (n.identifier !== null) && n !== '');
  };

  const checkParams = function (params) {
    return params.filter(parameter => (parameter.object !== undefined ?
        SourceFinder.generalCheck(parameter) : false));
  };

  const expressionAlias = function (node, identifier) {
    const expression = node.expression;
    return Utils.assignmentPointsTo(expression, identifier) ?
      SourceFinder.ASSIGNED_SOURCE(expression.left.name, expression.type, expression.loc) : null;
  };

  const declarationAlias = function (node, identifier) {
    const declarations = node.declarations.filter((declaration) => {
      if (declaration.type !== null) {
        return Utils.declarationPointsTo(declaration, identifier);
      } return false;
    });

    return declarations.reduce((acc, declaration) => (
      acc.concat(
        SourceFinder.DECLARED_SOURCE(declaration.id.name, declaration.type, declaration.loc))
      ), []);
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
    return uses.filter(n => n !== null);
  };

  const aliasInScope = function (source, scope) {
    const scopeBody = getScopeBody(scope);
    const sourceIdentifier = source.identifier;
    return pointsToInScopeBody(sourceIdentifier, scopeBody);
  };

  const findPointsTo = function (sourceArr, scope) {
    return sourceArr.reduce((acc, alias) => acc.concat(aliasInScope(alias, scope)), []);
  };

  const findReturnsInScope = function (scope) {
    return getScopeBody(scope).filter(statement => statement.type === 'ReturnStatement');
  };

  const returnPointsToSources = function (sources, returnStatement) {
    const returnsSource = sources.reduce((acc, source) => (
      acc || Utils.identifierUsedInReturn(source.identifier, returnStatement))
      , false);
    return returnsSource;
  };

  const functionReturnsSource = function (scope, sourcesInScope) {
    const returnsInFunction = findReturnsInScope(scope);
    const sourcesInFunction = findPointsTo(sourcesInScope, scope).concat(sourcesInScope);

    const returnsSource = returnsInFunction.map(returnStatement => (
      returnPointsToSources(sourcesInFunction, returnStatement)));
    return returnsSource.reduce(Utils.reduceBoolean, false);
  };

  const analyzeArrowFunction = function (scope) {
    const body = getScopeBody(scope);
    // check the parameters of the arrowfunction on whether they are sources
    const parameterSources = checkParams(getScopeParameters(scope));
    const sources = filterSourceVariables(scope);
    const sourceExpressions = body.filter(statement => SourceFinder.generalCheck(statement));
    console.log(sourceExpressions);
  };

  const sourcesInGlobalScope = function (ast) {
    const scopeManager = createScope(ast);
    const currentScope = scopeManager.acquire(ast);
    return filterSourceVariables(currentScope);
  };

  const getScopeParameters = function (scope) {
    return scope.block.params;
  };
// TODO make this do the full test?
  const analyzeGlobalScope = function (scope) {
    const body = getScopeBody(scope);
    const sources = filterSourceVariables(scope);
    return true;
  };

  const analyzeFunction = function (scope, upperScopeSources) {
    // Collect sources within a function.
    // Check whether the function returns any sources.
    // Return new functionSource.
    const sourcesInFunction = filterSourceVariables(scope);
    const sourcesInScope = sourcesInFunction.concat(upperScopeSources);
    return functionReturnsSource(scope, sourcesInScope) ?
      sourcesInFunction.concat(SourceFinder.FUNCTION_SOURCE(
        scope.block.id.name,
        sourcesInFunction,
        scope.block.loc))
      : sourcesInFunction;
  };

  const analyzeScope = function (scope, upperScopeSources = []) {
    switch (scope.type) {
      case 'function':
        return analyzeFunction(scope, upperScopeSources);
      default:
        return filterSourceVariables(scope);
    }
    // Takes a scope and checks whether it is vulnerable.
  };

  /**
   * Checks whether the sources are used in a child scope.
   */
  const nestedVariableSources = function checkChildScope(scope, sources = []) {
    const newSources = analyzeScope(scope, sources).concat(sources);

    const aliasesInScope = newSources.reduce((acc, identifier) => (
      acc.concat(aliasInScope(identifier, scope))), newSources);
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
    return sourceVariables.filter(n => n !== null);
  };

  const ast = GenerateAST.astFromFile('../test/ast_tests/scoped_source_reassign.js');
  const currentScope = createScope(ast).scopes[0];
  // console.log(currentScope);
  console.log(nestedVariableSources(currentScope));
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
