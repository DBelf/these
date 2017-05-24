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
    
    
    var sourcesInScope = function (scope) {
        var sources = []
        var variablesInScope = scope.variables;
        for (var i = 0; i < variablesInScope.length; i++) {//Starts at 1 because the first element is ??
            var defs = variablesInScope[i];
            var definedSource = checkDefsForSources(defs.defs);
            sources = sources.concat(definedSource);
        }
        return sources.filter(n => n !== '');
    }

    var checkDefsForSources = function (definition) {
        var defNode = definition[0].node;
        if(defNode.type === 'VariableDeclarator') {
            return sourceId(defNode);
        }
        return '';
    }

    //Returns the identifier of a source, or nothing if the node isn't a source.
    var sourceId = function(node){
       return sourceFinder.checkDeclaration(node) ? node.id.name : '' ;
    }

    //Recursive check over all child scopes.


    var createScope = function (ast) {
        var scopeManager = escope.analyze(ast);
        return scopeManager;
    }

    var ast = generateAST.astFromFile('../test/ast_tests/scoped_source_reassign.js');
    console.log(sourcesInGlobalScope(ast));


    return {
        sourcesInGlobalScope: sourcesInGlobalScope,
        createScope: createScope
    }
}();

module.exports = Scope;