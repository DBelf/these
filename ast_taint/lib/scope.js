/**
 * Created by dimitri on 18/05/2017.
 */

var estraverse = require('estraverse'),
    generateAST = require('./generate_ast'),
    utils = require('./utils'),
    sourceFinder = require('./source_finder');

var Scope = function () {

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
        return _scopeChain;
    }

    var enter = function(node){
        if(newScope(node)){
            _scopeChain.push([]);
        }
        if (_isVarDeclaration(node)){
            var currentScope = getLast(_scopeChain);
            if(sourceFinder.checkDeclaration(node)){//Only push known sources onto the current scope
                currentScope.push(node.id.name);//TODO decide whether I'll use whole node or just the id
            }
        }
        if(_isVarAssignment(node)){
            var currentScope = getLast(_scopeChain);
            checkAssignment(node);
        }
    }
    
    var leave = function (node) {
        
    }
    
    var checkAssignment = function (node) {
        var currentScope = getLast(_scopeChain);

        if (_isIdentifier(node.right)){//Already detected variable is reassigned
            var declaredSources = _scopeChain.map(function(scope){
                return isInScope(node.right, scope);
            });
            if (declaredSources.reduce(utils.reduceBoolean, false)){
               currentScope.push(node.left.name);
               return;
            }
        }

    }

    var isInScope = function (node, currentScope) {
        return ~currentScope.indexOf(node.name);
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