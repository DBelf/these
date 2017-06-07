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

  // Checks whether an expression (i.e. an assignment) is an alias.
  const expressionAlias = function (filepath, node, identifier) {
    const expression = node.expression;
    return Utils.assignmentPointsTo(expression, identifier) ?
      new SourceFinder.AssignedSource(
        filepath, expression.left.name, expression.type, expression.loc) : null;
  };

  // Checks whether a declaration statement is an alias of the identifier.
  const declarationAlias = function (filepath, node, identifier) {
    const declarations = node.declarations.filter((declaration) => {
      if (declaration.type !== null) {
        return Utils.declarationPointsTo(declaration, identifier);
      }
      return false;
    });

    return declarations.reduce((acc, declaration) => (
      acc.concat(
        new SourceFinder.DeclaredSource(
          filepath, declaration.id.name, declaration.type, declaration.loc))), []);
  };

  // FIXME Not sure whether this works for nested forloops.
  // Constructs the list of aliases within a scope.
  const pointsToInScopeBody = function (filepath, identifier, scopeBody) {
    let uses = [];
    scopeBody.forEach((element) => {
      switch (element.type) {
        case 'VariableDeclaration':
          uses = uses.concat(declarationAlias(filepath, element, identifier));
          break;
        case 'ExpressionStatement':
          uses = uses.concat(expressionAlias(filepath, element, identifier));
          break;
        default:
          break;
      }
    });
    return uses.filter(n => n !== null);
  };

  // Returns a list of the aliases of a source within a scope.
  const pointsToInScope = function (filepath, source, scope) {
    const scopeBody = getScopeBody(scope);
    const sourceIdentifier = source.identifier;
    return pointsToInScopeBody(filepath, sourceIdentifier, scopeBody);
  };

  // Constructs a list of all the aliases in the scope.
  const findPointsTo = function (filepath, sourceArr, scope) {
    return sourceArr.reduce(
      (acc, alias) => acc.concat(pointsToInScope(filepath, alias, scope)), []);
  };

  // Filters all returnstatements from the current scope.
  const returnsInScope = function (scope) {
    return getScopeBody(scope).filter(Utils.isReturn);
  };

  /**
   * Takes a returnstatement and checks whether it returns any of the source identifiers.
   */
  const returnPointsToSource = function (sources, returnStatement) {
    return sources.reduce((acc, source) => (
      acc || Utils.identifierUsedInReturn(source.identifier, returnStatement))
      , false);
  };

  /**
   * Filters all call expressions from the scope body and returns these.
   */
  const collectCallExpressions = function (scopeBody) {
    return scopeBody.filter(expression => (
      Utils.callExpressionWithIdentifier(expression)
    ));
  };

  /**
   * Checks the upper scope for statements calling the fucntion.
   * Returns the function source and any statements calling the function.
   */
  const functionCalled = function (filepath, scope, sourcesInFunction) {
    const functionName = scope.block.id !== null ? scope.block.id.name : 'anonymous';
    const functionSource = new SourceFinder.FunctionSource(
      filepath,
      functionName,
      sourcesInFunction,
      scope.block.loc);
    const upperScopeStatements = getScopeBody(scope.upper);
    const callExpressions = collectCallExpressions(upperScopeStatements).map(expression =>
      (expression.expression));

    // TODO do something with the callexpressions.
    // console.log(callExpressions);
    const communicationSources = functionSource.isCalledBy(callExpressions);

    const functionCalledBy = functionSource.isCalledBy(upperScopeStatements);
    return sourcesInFunction.concat(functionSource).concat(functionCalledBy);
  }; // This function might be replaced by a check in nested sources.

  /**
   * Checks all returnstatements in the top scope of the function an checks whether
   * are returned by the function or whether the function returns a source expression.
   * Returns all sources detected this way.
   */
  const functionIsSource = function (filepath, scope, sourcesInScope) {
    const returnsInFunction = returnsInScope(scope);
    const sourcesInFunction = findPointsTo(filepath, sourcesInScope, scope).concat(sourcesInScope);

    const sourceReturns = returnsInFunction.filter(statement => (
      Utils.returnsIdentifier(statement))).reduce((acc, returnStatement) => (
    acc || returnPointsToSource(sourcesInFunction, returnStatement)), false);
    // Checks both the identifiers and the full statements of the returnfunction.
    const returnAccessesSource = returnsInFunction.filter(statement => (
      !Utils.returnsIdentifier(statement))).reduce((acc, returnStatement) => (
      acc || SourceFinder.returnAccessesSource(returnStatement)
    ), false);

    if (sourceReturns || returnAccessesSource) {
      return functionCalled(filepath, scope, sourcesInFunction);
    }
    return sourcesInFunction;
  };

  /**
   * Filters all sources from the declaration and returns these.
   */
  const sourcesInDeclaration = function (declarationNode) {
    return declarationNode.declarations.filter(declaration => (
      SourceFinder.checkDeclaration(declaration)));
  };

  /**
   * Filters all declarations from the scopebody and filters all sources from this list,
   * returns the result.
   */
  const declaredSources = function (filepath, scopeBody) {
    const declarations = scopeBody.filter(Utils.isDeclaration);
    const sources = declarations.reduce((acc, declaration) => (
      acc.concat(sourcesInDeclaration(declaration))), []);
    return sources.map(source => new SourceFinder.DeclaredSource(
      filepath, source.id.name, source.loc));
  };

  /**
   * Filters all declarations that assign to an identifier from the scope body and returns these.
   */
  const collectAssignmentDeclarations = function (scopeBody) {
    const declarations = scopeBody.filter(Utils.isDeclaration);
    return declarations.reduce((acc, declaration) => (
      acc.concat(Utils.assignmentDeclarations(declaration))
    ), []);
  };

  /**
   * Filters all assignment expressions from the scope body and returns these.
   */
  const collectAssignmentExpressions = function (scopeBody) {
    return scopeBody.filter(expression => (
      Utils.expressionHasIdentifier(expression)
    ));
  };

  const sourceAccesses = function (filepath, scopeBody) {
    const memberAccesses = scopeBody.filter(Utils.isMemberExpression);
    const sourceMemberAccesses = memberAccesses.filter(statement => (
      SourceFinder.generalCheck(statement)));
    return sourceMemberAccesses.map(source => (
      new SourceFinder.AccessedSource(filepath, source.object.name, source.loc)));
  };

  /**
   * Collects the sources within a scope and returns a list of these.
   */
  const collectSources = function (filepath, scope, upperSources = []) {
    const scopeBody = getScopeBody(scope);
    const declaredAndUpperSources = declaredSources(filepath, scopeBody).concat(upperSources);
    const assignmentsInScope = collectAssignmentExpressions(scopeBody);
    const assignmentDeclarations = collectAssignmentDeclarations(scopeBody);
    const accessStatements = sourceAccesses(filepath, scopeBody);

    const potentialSources = assignmentsInScope.concat(assignmentDeclarations);
    const sources = declaredAndUpperSources.reduce((acc, source) => (
      acc.concat(source.isUsedIn(potentialSources))), declaredAndUpperSources);
    return sources.concat(accessStatements);
  };

  /**
   * Collects the sources within a functon and returns all the sources,
   * including the function if the function returns a source.
   */
  const analyzeFunction = function (filepath, scope, upperScopeSources = []) {
    // Collect sources within a function.
    // Check whether the function returns any sources.
    // Return new functionSource.
    const sourcesInFunction = collectSources(filepath, scope, upperScopeSources);
    return functionIsSource(filepath, scope, sourcesInFunction);
  };

  /**
   * Returns a list of the sources within the scope.
   * Takes possible points to of upper scopes into account.
   */
  const sourcesInScope = function (filepath, scope, upperScopeSources = []) {
    switch (scope.type) {
      case 'function':
        return analyzeFunction(filepath, scope, upperScopeSources);
      default:
        return collectSources(filepath, scope);
    }
  };

  /**
   * Depth first search of the scope nodes for sources.
   * Takes the sources of upper scopes into consideration aswell.
   */
  const nestedVariableSources = function checkChildScope(filepath, scope, sources = []) {
    const newSources = sourcesInScope(filepath, scope, sources).concat(sources);

    if (scope.childScopes.length < 1) {
      // Found all children in this branch of the scope tree.
      return newSources;
    }

    // Also want to find all the call expressions that use the sources within this scope level.
    return scope.childScopes.reduce((acc, childScope) => (
      acc.concat(checkChildScope(filepath, childScope, newSources))), []);
  };

  // const ast = GenerateAST.astFromFile('../test/ast_tests/declared_listener_function.js');
  // const globalScope = getGlobalScope(ast);
  // console.log(nestedVariableSources(globalScope));

  return {
    createScopeManager,
    getGlobalScope,
    nestedVariableSources,
  };
}());

// TODO Recursive check over all child scopes??
module.exports = Scope;
