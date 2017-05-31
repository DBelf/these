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
    return getScopeBody(scope).filter(Utils.isReturn);
  };

  // Takes a returnstatement and checks whether it returns any of the source identifiers.
  const returnPointsToSource = function (sources, returnStatement) {
    return sources.reduce((acc, source) => (
      acc || Utils.identifierUsedInReturn(source.identifier, returnStatement))
      , false);
  };


  const functionCalled = function (scope, sourcesInFunction) {
    const functionName = scope.block.id !== null ? scope.block.id.name : 'anonymous';
    const functionSource = new SourceFinder.FunctionSource(
      functionName,
      sourcesInFunction,
      scope.block.loc);
    const upperScopeStatements = getScopeBody(scope.upper);
    const functionCalledBy = functionSource.isCalledBy(upperScopeStatements);
    return sourcesInFunction.concat(functionSource).concat(functionCalledBy);
  };

  /** Checks all returnstatements in the top scope of the function an checks whether they return
   *  a source.
   */
  const functionIsSource = function (scope, sourcesInScope) {
    const returnsInFunction = returnsInScope(scope);
    const sourcesInFunction = findPointsTo(sourcesInScope, scope).concat(sourcesInScope);

    const sourceReturns = returnsInFunction.filter(statement => (
      Utils.returnsIdentifier(statement))).reduce((acc, returnStatement) => (
      acc || returnPointsToSource(sourcesInFunction, returnStatement)), false);
    // Checks both the identifiers and the full statements of the returnfunction.
    const returnAccessesSource = returnsInFunction.filter(statement => (
      !Utils.returnsIdentifier(statement))).reduce((acc, returnStatement) => (
      acc || SourceFinder.returnAccessesSource(returnStatement)
    ), false);

    if (sourceReturns || returnAccessesSource) {
      return functionCalled(scope, sourcesInFunction);
    }
    return sourcesInFunction;
  };

  // FIXME does not do anything at the moment.
  const analyzeArrowFunction = function (scope) {
    const body = getScopeBody(scope);
    // check the parameters of the arrowfunction on whether they are sources
    const parameterSources = checkParams(getScopeParameters(scope));
    // const sources = filterSourceVariables(scope);
    const sourceExpressions = body.filter(statement => SourceFinder.generalCheck(statement));
    console.log(sourceExpressions);
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

  const collectCallExpressions = function (scopeBody) {
    return scopeBody.filter(expression => (
      Utils.callExpressionWithIdentifier(expression)
    ));
  };

  // Returns all sources in a scope.
  const collectSources = function (scope, upperSources = []) {
    const scopeBody = getScopeBody(scope);
    const declaredAndUpperSources = declaredSources(scopeBody).concat(upperSources);
    const assignmentsInScope = collectAssignmentExpressions(scopeBody);
    const assignmentDeclarations = collectAssignmentDeclarations(scopeBody);
    const callExpressions = collectCallExpressions(scopeBody);
    // TODO do something with the callexpressions.
    callExpressions.map(expression => console.log(expression.expression.callee.object.name));
    const potentialSources = assignmentsInScope.concat(assignmentDeclarations);
    const sources = declaredAndUpperSources.reduce((acc, source) => (
      acc.concat(source.isUsedIn(potentialSources))), declaredAndUpperSources);
    return sources;
  };

  // FIXME Does NOT!! check whether the parameters of the function are used in a bad way.
  const analyzeFunction = function (scope, upperScopeSources = []) {
    // Collect sources within a function.
    // Check whether the function returns any sources.
    // Return new functionSource.
    const sourcesInFunction = collectSources(scope, upperScopeSources);
    return functionIsSource(scope, sourcesInFunction);
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

  // const ast = GenerateAST.astFromFile('../test/ast_tests/scoped_sources_with_function_return.js');
  // const globalScope = getGlobalScope(ast);
  // console.log(nestedVariableSources(globalScope));
  // const currentScope = createScopeManager(ast).scopes[0];
  // console.log(currentScope);
  // console.log(nestedVariableSources(currentScope));
  // console.log(findAllAliases(sourceArr, currentScope));

  return {
    functionIsSource,
    createScopeManager,
    getGlobalScope,
    nestedVariableSources,
  };
}());

// TODO Recursive check over all child scopes??
module.exports = Scope;
