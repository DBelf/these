/**
 * Created by dimitri on 18/05/2017.
 */

var estraverse = require('estraverse'),
    generateAST = require('./generate_ast'),
    utils = require('./utils'),
    sourceFinder = require('./source_finder'),
    escope = require('escope');

var Scope = function () {

    var knownSinks = [];

    var _scopeChain = [];
    var _isVarDeclaration = utils.isOfType('VariableDeclarator');
    var _isVarAssignment = utils.isOfType('AssignmentExpression');
    var _isIdentifier = utils.isOfType('Identifier');
    var _isProgram = utils.isOfType('Program');
    var _isFunctionDeclaration = utils.isOfType('FunctionDeclaration');
    var _isFunctionExpression = utils.isOfType('FunctionExpression');
    
    var getLast = function (array) {
        return array[array.length - 1];
    }
    
    var analyzeScope = function (ast) {
        _scopeChain = [];
        estraverse.traverse(ast, {
            enter: enter,
            leave, leave
        });
        return knownSinks;
    }

    var enter = function(node){
        if(newScope(node)){
            _scopeChain.push([]);
        }
        if (_isVarDeclaration(node)){
            var currentScope = getLast(_scopeChain);
            if(checkDeclaration(node)){//Only push known sources onto the current scope
                currentScope.push(node.id.name);//TODO decide whether I'll use whole node or just the id
            }
        }

        if(_isVarAssignment(node)){
            var currentScope = getLast(_scopeChain);
            if (checkAssignment(node)) {
                currentScope.push(node.left.name);
            }

        }
    }

    var leave = function (node) {
        if (newScope(node)){
            //Check for paths?
            knownSinks.push(_scopeChain.pop());
        }
    }

    var checkDeclaration = function (node) {
        if (node.init === null) {
            return false;
        }
        switch (node.init.type) {
            case 'Identifier':
                return identifierInScope(node.init.name);
            default:
                return sourceFinder.checkDeclaration(node);
        }
    }

    var checkAssignment = function(node){
        if (_isIdentifier(node.right)){
            return identifierInScope(node.right.name);
        }
        return false;
    }

    var identifierInScope = function (identifier) {
        var declaredSources = _scopeChain.map(function(scope){
            return isInScope(identifier, scope);
        });
        return (declaredSources.reduce(utils.reduceBoolean, false));
    }

    var isInScope = function (identifier, currentScope) {
        return ~currentScope.indexOf(identifier);
    }

    var newScope = function (node) {
        return _isFunctionDeclaration(node) ||
                _isFunctionExpression(node) ||
                _isProgram(node);
    }
    return {
        analyzeScope: analyzeScope
    }
}();

module.exports = Scope;