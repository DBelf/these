/**
 * Created by dimitri on 18/05/2017.
 */

var estraverse = require('estraverse'),
    generateAST = require('./generate_ast'),
    utils = require('./utils'),
    sourceFinder = require('./source_finder'),
    escope = require('escope');

var Scope = function () {

    var TEMPLATE_SCOPE_MANAGER_WRAPPER = function (scope) {
        return {
            scope: scope,
            knownSources: [],
            knownSinks: []
        }
    }

    var sourcesInGlobalScope = function (ast) {
        var scopeManager = createScope(ast);
        globalScope = scopeManager.acquire(ast);
        return sourcesInScope(globalScope);
    }

    var sourcesInFile = function (ast) {
        var scopeManager = createScope(ast);
        var scopes = scopeManager.scopes;
        var sources = [];
        for (var i = 0; i < scopeManager.scopes.length; i++) {
            var foundSources = sourcesInScope(scopes[i]);
            sources = sources.concat(foundSources);
        }
        return sources.filter(n => n !== '');
    }

    var sourcesInScope = function (scope) {
        var sources = []
        var variablesInScope = scope.variables;
        for (var i = 0; i < variablesInScope.length; i++) {
            var defs = variablesInScope[i];
            if (defs.name === 'arguments') {
                continue;
            }
            var definedSource = checkDefsForSources(defs.defs);
            sources = sources.concat(definedSource);

        }

        return sources.filter(n => n !== '');
    }

    //Dispatch and switch on the type???
    var checkDefsForSources = function (definition) {
        var defNode = definition[0].node;
        if (defNode.type === 'VariableDeclarator') {
            return sourceId(defNode);
        }
        return '';
    }

    //Returns the identifier of a source, or nothing if the node isn't a source.
    var sourceId = function (node) {
        return sourceFinder.checkDeclaration(node) ? node.id.name : '';
    }

    var pointsToInScope = function (identifier, scope) {
        var scopeBody = getScopeBody(scope);
        return pointsToInScopeBody(identifier, scopeBody);
    }

    var getScopeBody = function (scope) {
        switch (scope.type) {
            case 'global':
                return scope.block.body;
            case 'function':
                return scope.block.body.body;
            default:
                return;
                break;
        }
    }

    //Not sure whether this works for nested forloops.
    var pointsToInScopeBody = function (identifier, scopeBody) {
        var uses = [];
        for (var i = 0; i < scopeBody.length; i++) {
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
    }

    var expressionAlias = function (node, identifier) {
        var expression = node.expression;

        if (utils.assignmentPointsTo(expression, identifier)) {
            return expression.left.name;
        }
        return '';
    }

    var declarationAlias = function (node, identifier) {
        var declarations = node.declarations;
        var aliases = [];
        for (var i = 0; i < declarations.length; i++) {
            if (declarations[i].init !== null) {
                if (utils.declarationPointsTo(declarations[i], identifier)) {
                    aliases.push(declarations[i].id.name);
                }
            }
        }
        return aliases;
    }

    var findAllAliases = function (sourceArr, scope) {
        var aliases = [];
        for (var i = 0; i < sourceArr.length; i++) {
            //This might miss the assign of a reassigned value.. But that would just be plain silly?
            aliases = aliases.concat(pointsToInScope(sourceArr[i], scope));
        }
        return aliases;
    }

    var findReturnsInScope = function (scope) {
        var returnStatements = [];
        var scopeBody = getScopeBody(scope);
        for (var i = 1; i < scopeBody.length; i++) {
            switch (scopeBody[i].type){
                case 'ReturnStatement':
                    returnStatements = returnStatements.concat(scopeBody[i]);
            }
        }
        return returnStatements;
    }

    var functionReturnsSource = function (scope) {
        var sourcesInFunction = sourcesInScope(scope);
        sourcesInFunction = sourcesInFunction.concat(findAllAliases(sourcesInFunction, scope));
        var returnsSource = sourcesInFunction.map(function (sourceIdentifier) {

        });
        return returnsSource.reduce(utils.reduceBoolean, false);
    }

    var createScope = function (ast) {
        var scopeManager = escope.analyze(ast);
        return scopeManager;
    }

    var ast = generateAST.astFromFile('../test/ast_tests/function_return.js');
    var globalScope = createScope(ast).scopes[1];
    var sources = sourcesInFile(ast);
    console.log(functionReturnsSource(globalScope));

    return {
        sourcesInGlobalScope: sourcesInGlobalScope,
        sourcesInFile: sourcesInFile,
        createScope: createScope
    }
}();

//TODO Recursive check over all child scopes??
module.exports = Scope;