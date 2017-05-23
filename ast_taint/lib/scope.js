/**
 * Created by dimitri on 18/05/2017.
 */

var estraverse = require('estraverse'),
    generateAST = require('./generate_ast'),
    utils = require('./utils'),
    sourceFinder = require('./source_finder');

var Scope = function () {

    var _scopeChain = [];
    var _isVarDeclaration = utils.isOfType('VariableDeclaration');
    var _isVarAssignment = utils.isOfType('AssignmentExpression');
    var _isProgram = utils.isOfType('Program');
    var _isFunctionDeclaration = utils.isOfType('FunctionDeclaration');
    var _isFunctionExpression = utils.isOfType('FunctionExpression');
    
    var getLast = function (array) {
        return array[array.length - 1];
    }
    
    var createScope = function (ast) {
        _scopeChain = [];
        estraverse.traverse(ast, {
            enter: enter,
            leave, leave
        });
    }

    var enter = function(node){
        if(newScope(node)){
            _scopeChain.push([]);
        }
        if (_isVarDeclaration(node)){
            var currentScope = getLast(_scopeChain);
            if(sourceFinder.checkDeclaration(node)){
                currentScope.push(node.id);
            }
        }
        if(_isVarAssignment(node)){

        }
    }

    var newScope = function (node) {
        return _isFunctionDeclaration(node) ||
                _isFunctionExpression(node) ||
                _isProgram(node);
    }

    var ast = generateAST.astFromFile('../test/ast_tests/source_in_function.js');

    return {
    }
}();