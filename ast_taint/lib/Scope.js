/**
 * Created by dimitri on 18/05/2017.
 */

const GenerateAST = require('./GenerateAST');
const Utils = require('./Utils');
const SourceFinder = require('./SourceFinder');
const escope = require('escope');

const Scope = (function scoping() {
  // Creates the scopemanager.
  const createScopeManager = function (ast) {
    return escope.analyze(ast);
  };

  // Returns the global scope of the ast.
  const getGlobalScope = function (ast) {
    return createScopeManager(ast).scopes[0];
  };

  // Breaks on arrowexpressions?
  // Returns the body of statements within the scope.
  const getScopeBody = function (scope) {
    switch (scope.block.type) {
      case 'FunctionDeclaration':
        return [].concat(scope.block.body.body);
      case 'FunctionExpression':
        return [].concat(scope.block.body.body);
      default:
        return [].concat(scope.block.body);
    }
  };

  // Returns the identifier of a source, or nothing if the node isn't a source.
  // TODO move this to the Utils module.
  const sourceId = function (node) {
    return SourceFinder.checkDeclaration(node) ? node.id.name : null;
  };

  // Dispatch and switch on the type???
  // Returns a new source object if we've found a source.
  const checkDefsForSources = function (definition) {
    const defNode = definition[0].node;

    return Utils.isDeclaration(defNode) ?
      SourceFinder.DeclaredSource(sourceId(defNode), 'VariableDeclarator', defNode.loc) : '';
  };

  // Filters the sources declared in the current scope.
  const filterSourceVariables = function (scope) {
    // Filter the arguments passed, when it is a function.
    const variablesInScope = scope.variables.filter(variable => variable.name !== 'arguments');
    const sources = variablesInScope.reduce((acc, variable) => (
      acc.concat(checkDefsForSources(variable.defs))
    ), []);
    return sources.filter(n => (n.identifier !== null) && n !== '');
  };

  // Checks whether the parameters of an arrowfunction are sources.
  // TODO maybe this can be used to check functions passed.
  const checkParams = function (params) {
    return params.filter(parameter => (parameter.object !== undefined ?
      SourceFinder.generalCheck(parameter) : false));
  };

  // Checks whether an expression (i.e. an assignment) is an alias.
  const expressionAlias = function (node, identifier) {
    const expression = node.expression;
    return Utils.assignmentPointsTo(expression, identifier) ?
      new SourceFinder.AssignedSource(expression.left.name, expression.type, expression.loc) : null;
  };

  // Checks whether a declaration statement is an alias of the identifier.
  const declarationAlias = function (node, identifier) {
    const declarations = node.declarations.filter((declaration) => {
      if (declaration.type !== null) {
        return Utils.declarationPointsTo(declaration, identifier);
      }
      return false;
    });

    return declarations.reduce((acc, declaration) => (
      acc.concat(
        new SourceFinder.DeclaredSource(declaration.id.name, declaration.type, declaration.loc))
    ), []);
  };

  // FIXME Not sure whether this works for nested forloops.
  // Constructs the list of aliases within a scope.
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

  // Returns a list of the aliases of a source within a scope.
  const pointsToInScope = function (source, scope) {
    const scopeBody = getScopeBody(scope);
    const sourceIdentifier = source.identifier;
    return pointsToInScopeBody(sourceIdentifier, scopeBody);
  };

  // Constructs a list of all the aliases in the scope.
  const findPointsTo = function (sourceArr, scope) {
    return sourceArr.reduce((acc, alias) => acc.concat(pointsToInScope(alias, scope)), []);
  };

  // Filters all returnstatements from the current scope.
  const returnsInScope = function (scope) {
    return getScopeBody(scope).filter(statement => statement.type === 'ReturnStatement');
  };

  // Takes a returnstatement and checks whether it returns any of the source identifiers.
  const returnPointsToSource = function (sources, returnStatement) {
    return sources.reduce((acc, source) => (
      acc || Utils.identifierUsedInReturn(source.identifier, returnStatement))
      , false);
  };

  /** Checks all returnstatements in the top scope of the function an checks whether they return
   *  a source.
   */
  const functionReturnsSource = function (scope, sourcesInScope) {
    const returnsInFunction = returnsInScope(scope);
    const sourcesInFunction = findPointsTo(sourcesInScope, scope).concat(sourcesInScope);

    const returnsSource = returnsInFunction.map(returnStatement => (
      returnPointsToSource(sourcesInFunction, returnStatement)));
    // Checks both the identifiers and the full statements of the returnfunction.
    return returnsSource.reduce(Utils.reduceBoolean, false) ||
      returnsInFunction.filter(
        returnStatement => SourceFinder.returnAccessesSource(returnStatement));
  };

  // FIXME does not do anything at the moment.
  const analyzeArrowFunction = function (scope) {
    const body = getScopeBody(scope);
    // check the parameters of the arrowfunction on whether they are sources
    const parameterSources = checkParams(getScopeParameters(scope));
    const sources = filterSourceVariables(scope);
    const sourceExpressions = body.filter(statement => SourceFinder.generalCheck(statement));
    console.log(sourceExpressions);
  };

  // TODO do I need this?
  const sourcesInGlobalScope = function (ast) {
    const scopeManager = createScopeManager(ast);
    const currentScope = scopeManager.acquire(ast);
    return filterSourceVariables(currentScope);
  };

  const getScopeParameters = function (scope) {
    return scope.block.params;
  };

  const sourcesInDeclaration = function (declarationNode) {
    return declarationNode.declarations.filter(declaration => (
      SourceFinder.checkDeclaration(declaration)));
  };

  // Finds all sources declared within the scope.
  const declaredSources = function (scopeBody) {
    const declarations = scopeBody.filter(Utils.isDeclaration);
    const sources = declarations.reduce((acc, declaration) => (
      acc.concat(sourcesInDeclaration(declaration))), []);
    return sources.map(source => new SourceFinder.DeclaredSource(source.id.name, source.loc));
  };

  const collectAssignmentDeclarations = function (scopeBody) {
    const declarations = scopeBody.filter(Utils.isDeclaration);
    return declarations.reduce((acc, declaration) => (
      acc.concat(Utils.assignmentDeclarations(declaration))
    ), []);
  };

  const collectAssignmentExpressions = function (scopeBody) {
    return scopeBody.filter(expression => (
      Utils.expressionHasIdentifier(expression)
    ));
  };

  // Returns all sources in a scope.
  const collectSources = function (scope, upperSources = []) {
    const scopeBody = getScopeBody(scope);
    const declaredAndUpperSources = declaredSources(scopeBody).concat(upperSources);
    const assignmentsInScope = collectAssignmentExpressions(scopeBody);
    const assignmentDeclarations = collectAssignmentDeclarations(scopeBody);
    const potentialSources = assignmentsInScope.concat(assignmentDeclarations);
    const sources = declaredAndUpperSources.reduce((acc, source) => (
      acc.concat(source.isUsedIn(potentialSources))), declaredAndUpperSources);
    return sources;
  };

// FIXME Does NOT!! check whether the parameters of the function are used in a bad way.
  const analyzeFunction = function (scope, upperScopeSources) {
    // Collect sources within a function.
    // Check whether the function returns any sources.
    // Return new functionSource.
    const sourcesInFunction = collectSources(scope, upperScopeSources);
    const functionName = scope.block.id !== null ? scope.block.id.name : 'anonymous';
    return functionReturnsSource(scope, sourcesInFunction) ?
      sourcesInFunction.concat(new SourceFinder.FunctionSource(
        functionName,
        sourcesInFunction,
        scope.block.loc))
      : sourcesInFunction;
  };

  /**
   * Returns a list of the sources within the scope.
   * Takes possible points to of upper scopes into account.
   */
  const sourcesInScope = function (scope, upperScopeSources = []) {
    switch (scope.type) {
      case 'function':
        return analyzeFunction(scope, upperScopeSources);
      default:
        return collectSources(scope);
    }
  };

  /**
   * Depth first search of the scope nodes for sources.
   * Takes the sources of upper scopes into consideration aswell.
   */
  const nestedVariableSources = function checkChildScope(scope, sources = []) {
    const newSources = sourcesInScope(scope, sources).concat(sources);

    if (scope.childScopes.length < 1) {
      // Found all children in this branch of the scope tree.
      return newSources;
    }
    return scope.childScopes.reduce((acc, childScope) => (
      acc.concat(checkChildScope(childScope, newSources))), []);
  };

  const ast = GenerateAST.astFromFile('../test/ast_tests/scoped_sources.js');
  const globalScope = getGlobalScope(ast);
  console.log(nestedVariableSources(globalScope));
  // const currentScope = createScopeManager(ast).scopes[0];
  // console.log(currentScope);
  // console.log(nestedVariableSources(currentScope));
  // console.log(findAllAliases(sourceArr, currentScope));

  return {
    sourcesInGlobalScope,
    functionReturnsSource,
    createScopeManager,
    getGlobalScope,
    nestedVariableSources,
  };
}());

// TODO Recursive check over all child scopes??
module.exports = Scope;
