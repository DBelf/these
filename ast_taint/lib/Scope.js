/**
 * Created by dimitri on 18/05/2017.
 */

const GenerateAST = require('./GenerateAST');
const Utils = require('./Utils');
const SourceFinder = require('./SourceFinder');
const SinkFinder = require('./SinkFinder');
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

  // TODO complete this
  const hoistFromControl = function hoist(statement) {
    switch (statement.type) {
      case 'ForStatement': // Fall through.
      case 'ForOfStatement': // Fall through.
      case 'ForInStatement':
        if (statement.body.body !== undefined) {
          return statement.body.body.reduce(
            (acc, bodyStatement) => acc.concat(hoist(bodyStatement)), []);
        } return [].concat(statement.body);
      case 'LabeledStatement':
        return statement;// Not addind this, no labeled statements for me...
      case 'TryStatement': {
        const tryBody = statement.block.body.reduce((acc, blockStatement) =>
          acc.concat(hoist(blockStatement)), []);
        const catchBody = statement.handler.body.body.reduce((acc, blockStatement) =>
          acc.concat(hoist(blockStatement)), []);
        let finalBody = [];
        if (statement.finalizer !== null) {
          finalBody = statement.finalizer.body.reduce((acc, blockStatement) =>
            acc.concat(hoist(blockStatement)), []);
        }
        return tryBody.concat(catchBody.concat(finalBody));
      }
      case 'IfStatement': {
        let consequent = [];
        if (statement.consequent.body !== undefined) {
          consequent = statement.consequent.body.reduce(
            (acc, bodyStatement) => acc.concat(hoist(bodyStatement)), []);
        } else {
          consequent = consequent.concat(statement.consequent);
        }
        let alternate = [];
        if (statement.alternate !== null) {
          if (statement.alternate.body !== undefined) {
            alternate = statement.alternate.body.reduce(
              (acc, bodyStatement) => acc.concat(hoist(bodyStatement)), []);
          } else {
            alternate = alternate.concat(statement.alternate);
          }
        }
        return consequent.concat(alternate);
      }
      case 'SwitchStatement':
        return statement.cases.reduce((acc, switchCase) =>
          acc.concat(hoist(switchCase.consequent)), []);
      default:
        return statement;
    }
  };

  // Returns the body of statements within the scope.
  const getScopeBody = function (scope) {
    let statements = [];
    switch (scope.block.type) {
      case 'FunctionDeclaration':
        statements = [].concat(scope.block.body.body);
        break;
      case 'FunctionExpression':
        statements = [].concat(scope.block.body.body);
        break;
      default:
        statements = [].concat(scope.block.body);
        break;
    }
    return statements.reduce((acc, statement) => acc.concat(hoistFromControl(statement)), []);
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
    const functionCalledBy = functionSource.isCalledBy(upperScopeStatements);
    return sourcesInFunction.concat(functionSource).concat(functionCalledBy);
  };

  /**
   * Checks all returnstatements in the top scope of the function an checks whether
   * are returned by the function or whether the function returns a source expression.
   * Returns all sources detected this way.
   */
  const functionIsSource = function (filepath, scope, sourcesInScope) {
    const returnsInFunction = returnsInScope(scope);
    // There's a chance this gets hit twice?

    const sourceReturns = returnsInFunction.filter(statement => (
      Utils.returnsIdentifier(statement))).reduce((acc, returnStatement) => (
    acc || returnPointsToSource(sourcesInScope, returnStatement)), false);
    // Checks both the identifiers and the full statements of the returnfunction.
    const returnAccessesSource = returnsInFunction.filter(statement => (
      !Utils.returnsIdentifier(statement))).reduce((acc, returnStatement) => (
      acc || SourceFinder.returnAccessesSource(returnStatement)
    ), false);

    if (sourceReturns || returnAccessesSource) {
      return functionCalled(filepath, scope, sourcesInScope);
    }
    return sourcesInScope;
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
  const collectSources = function (filepath, scopeBody, upperSources = []) {
    const declaredAndUpperSources = upperSources.concat(declaredSources(filepath, scopeBody));
    const assignmentsInScope = collectAssignmentExpressions(scopeBody);
    const assignmentDeclarations = collectAssignmentDeclarations(scopeBody);
    // const ifClauses = collectIfStatements(filepath, scopeBody, upperSources);
    const accessStatements = sourceAccesses(filepath, scopeBody);

    const potentialSources = assignmentsInScope.concat(assignmentDeclarations);
    // Missing any other statements.
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
    const scopeBody = getScopeBody(scope);
    const sourcesInFunction = collectSources(filepath, scopeBody, upperScopeSources);
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
        return collectSources(filepath, getScopeBody(scope));
    }
  };

  /**
   * Depth first search of the scope nodes for sources.
   * Takes the sources of upper scopes into consideration aswell.
   */
  const nestedVariableSources = function checkChildScope(filepath, scope, sources = []) {
    const newSources = sourcesInScope(filepath, scope, sources);
    if (scope.childScopes.length < 1) {
      // Found all children in this branch of the scope tree.
      return newSources;
    }
    // Also want to find all the call expressions that use the sources within this scope level.
    return scope.childScopes.reduce((acc, childScope) => (
      acc.concat(checkChildScope(filepath, childScope, newSources))), []);
  };

  const declaredSinks = function (filename, declarations) {
    return declarations.reduce((acc, declaration) => (
      acc.concat(SinkFinder.checkDeclaration(filename, declaration.declarations))
    ), []);
  };

  const calledSinks = function (filename, expressions) {
    const callExpressions = expressions.filter(expression => (
      Utils.isCallExpression(expression.expression)));
    return callExpressions.reduce((acc, expression) => (
      acc.concat(SinkFinder.expressionIsSink(filename, expression.expression))), []);
  };

  const assignedSinks = function (filename, expressions) {
    const assignmentExpressions = expressions.filter(expression => (
      Utils.isAssignment(expression.expression)
    ));
    return assignmentExpressions.reduce((acc, expression) => (
      acc.concat(SinkFinder.checkAssignmentExpression(filename, expression.expression))
    ), []);
  };

  const collectSinkCalls = function (filename, scopeBody) {
    const declarations = scopeBody.filter(Utils.isDeclaration);
    const expressions = scopeBody.filter(Utils.isExpression);
    const expressionSinks = calledSinks(filename, expressions).concat(
      assignedSinks(filename, expressions));
    const declarationSinks = declaredSinks(filename, declarations);
    return expressionSinks.concat(declarationSinks);
  };

  const sinksInScope = function (filename, scope) {
    const scopeBody = getScopeBody(scope);
    return collectSinkCalls(filename, scopeBody);
  };

  const nestedSinks = function sinkInChild(filename, scope, sinks = []) {
    const newSinks = sinksInScope(filename, scope).concat(sinks);

    if (scope.childScopes.length < 1) {
      return newSinks;
    }

    return scope.childScopes.reduce((acc, childScope) => (
      acc.concat(sinkInChild(filename, childScope, newSinks))), []);
  };

  const nestedVulnerabilities = function checkChildScope(
    filename, scope, vulnerabilities = { sources: [], sinks: [] }) {
    const sources = vulnerabilities.sources;
    const sinks = vulnerabilities.sinks;
    const newSources = sourcesInScope(filename, scope, sources);
    const newSinks = sinksInScope(filename, scope);
    const sinkWithSources = newSinks.reduce((acc, sink) =>
      acc.concat(sink.argumentIsSource(newSources)), []);
    if (scope.childScopes.length < 1) {
      // Found all children in this branch of the scope tree.
      return {
        sources: newSources,
        sinks: sinks.concat(newSinks.concat(sinkWithSources)),
      };
    }
    // Also want to find all the call expressions that use the sources within this scope level.
    return scope.childScopes.reduce((acc, childScope) => {
      const hits = checkChildScope(
          filename,
          childScope,
          { sources: newSources, sinks: newSinks.concat(sinkWithSources) });
      const objectSources = hits.sources;
      const objectSinks = hits.sinks;
      return { sources: objectSources, sinks: objectSinks };
    }, { sources: [], sinks: [] });// Dit kan eleganter
  };
  //
  // const path = '../test/ast_tests/source/switch_sources.js';
  // const ast = GenerateAST.astFromFile(path);
  // const globalScope = getGlobalScope(ast);
  // console.log(nestedVulnerabilities(path, globalScope));

  return {
    hoistFromControl,
    createScopeManager,
    getGlobalScope,
    nestedVariableSources,
    nestedSinks,
    nestedVulnerabilities,
  };
}());

module.exports = Scope;
