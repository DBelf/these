/**
 * Created by dimitri on 18/05/2017.
 */

const generateAST = require('./generate_ast');
const utils = require('./utils');
const sourceFinder = require('./source_finder');
const escope = require('escope');

const Scope = (function () {
  const TEMPLATE_SCOPE_MANAGER_WRAPPER = function (scope) {
    return {
      scope,
      knownSources: [],
      knownSinks: [],
    };
  };

  const sourcesInGlobalScope = function (ast) {
    const scopeManager = this.createScope(ast);
    const currentScope = scopeManager.acquire(ast);
    return this.sourcesInScope(currentScope);
  };

  const sourcesInFile = function (ast) {
    const scopeManager = createScope(ast);
    const scopes = scopeManager.scopes;
    let sources = [];
    for (let i = 0; i < scopeManager.scopes.length; i++) {
      const foundSources = sourcesInScope(scopes[i]);
      sources = sources.concat(foundSources);
    }
    return sources.filter(n => n !== '');
  };

  const sourcesInScope = function (scope) {
    let sources = [];
    const variablesInScope = scope.variables;
    for (let i = 0; i < variablesInScope.length; i++) {
      const defs = variablesInScope[i];
      if (defs.name !== 'arguments') {
        const definedSource = checkDefsForSources(defs.defs);
        sources = sources.concat(definedSource);
      }
    }

    return sources.filter(n => n !== '');
  };

    // Dispatch and switch on the type???
  const checkDefsForSources = function (definition) {
    const defNode = definition[0].node;
    if (defNode.type === 'VariableDeclarator') {
      return sourceId(defNode);
    }
    return '';
  };

    // Returns the identifier of a source, or nothing if the node isn't a source.
  const sourceId = function (node) {
    return sourceFinder.checkDeclaration(node) ? node.id.name : '';
  };

  const pointsToInScope = function (identifier, scope) {
    const scopeBody = getScopeBody(scope);
    return pointsToInScopeBody(identifier, scopeBody);
  };

  const getScopeBody = function (scope) {
    switch (scope.type) {
      case 'function':
        return scope.block.body.body;
      default:
        return scope.block.body;
    }
  };

    // Not sure whether this works for nested forloops.
  const pointsToInScopeBody = function (identifier, scopeBody) {
    let uses = [];
    for (let i = 0; i < scopeBody.length; i++) {
      switch (scopeBody[i].type) {
        case 'VariableDeclaration':
          uses = uses.concat(declarationAlias(scopeBody[i], identifier));
          break;
        case 'ExpressionStatement':
          uses = uses.concat(expressionAlias(scopeBody[i], identifier));
          break;
        default:
          break;
      }
    }
    return uses.filter(n => n !== '');
  };

  const expressionAlias = function (node, identifier) {
    const expression = node.expression;

    if (utils.assignmentPointsTo(expression, identifier)) {
      return expression.left.name;
    }
    return '';
  };

  const declarationAlias = function (node, identifier) {
    const declarations = node.declarations;
    const aliases = [];
    declarations.forEach((declaration) => {
      if (declaration !== null) {
        if (utils.declarationPointsTo(declaration, identifier)) {
          aliases.push(declaration.id.name);
        }
      }
    });
    return aliases;
  };

  const findAllAliases = function (sourceArr, scope) {
    let aliases = [];
    sourceArr.forEach((alias) => {
      aliases = alias.concat(pointsToInScope(alias, scope));
    });
    return aliases;
  };

  const findReturnsInScope = function (scope) {
    let returnStatements = [];
    const scopeBody = getScopeBody(scope);
    for (let i = 1; i < scopeBody.length; i++) {
      switch (scopeBody[i].type) {
        case 'ReturnStatement':
          returnStatements = returnStatements.concat(scopeBody[i]);
      }
    }
    return returnStatements;
  };

  const functionReturnsSource = function (scope) {
    let sourcesInFunction = sourcesInScope(scope);
    const returnsInFunction = findReturnsInScope(scope);
    sourcesInFunction = sourcesInFunction.concat(findAllAliases(sourcesInFunction, scope));
    const returnsSource = returnsInFunction.map((returnStatement) => {
      for (let i = 0; i < sourcesInFunction.length; i++) {
        if (utils.identifierUsedInReturn(sourcesInFunction[i], returnStatement)) {
          return true;
        }
      }
      return false;
    });
    return returnsSource.reduce(utils.reduceBoolean, false);
  };

  var createScope = function (ast) {
    const scopeManager = escope.analyze(ast);
    return scopeManager;
  };

  const ast = generateAST.astFromFile('../test/ast_tests/function_return.js');
  const currentScope = createScope(ast).scopes[1];
  const sources = sourcesInFile(ast);
  console.log(functionReturnsSource(currentScope));

  return {
    sourcesInGlobalScope,
    sourcesInFile,
    createScope,
  };
}());

// TODO Recursive check over all child scopes??
module.exports = Scope;
