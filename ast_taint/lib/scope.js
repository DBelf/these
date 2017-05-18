/**
 * Created by dimitri on 18/05/2017.
 */

var estraverse = require('estraverse');
var generateAST = require('./generate_ast');

var Scope = function () {

    var TEMPLATE_GLOBAL_SCOPE = function (identifiers, scopes) {
        return {
            'scope_level': 'global',
            'declared_variables': identifiers || [],
            'assigned_variables': identifiers || [],
            'scopes': scopes || []
        }
    }

    var TEMPLATE_SCOPE = function (identifiers, scopes) {
        return {
            'declared_variables': identifiers || [],
            'assigned_variables': identifiers || [],
            'scopes': scopes || []
        }
    }

    var TEMPLATE_IDENTIFIER = function (name) {
        return {
            'type': 'Identifier',
            'name': name || '_anonymous_'
        }
    }

    var TEMPLATE_VARIABLE_DECLARATION = function (id, init) {
        return {
            'type': 'VariableDeclarator',
            'id': TEMPLATE_IDENTIFIER(id),
            'init': init || null,
            'tainted': false
        }
    }

    var TEMPLATE_VARIABLE_ASSIGNMENT = function (left, right, operator) {
        return {
            'type': 'AssignmentExpression',
            'left': left || TEMPLATE_IDENTIFIER(),
            'right': right || TEMPLATE_IDENTIFIER(),
            'operator': operator || '=',
            'tainted': false
        }
    }

    var TEMPLATE_FUNCTION_DECLARATION = function (id, params, body) {
        return {
            'type': 'FunctionDeclaration',
            'id': TEMPLATE_IDENTIFIER(id),
            'params': params || [],
            'body': body || TEMPLATE_BLOCK()
        }
    }

    var TEMPLATE_BLOCK = function (body) {
        return {
            'type': 'BlockStatement',
            'body': body || []
        }
    }

    var constructScope = function (ast) {
        var scopeQueue = [];

        estraverse.traverse(ast, {
                enter: function (node) {
                    switch (node.type) {
                        case 'Program':
                            scopeQueue.push(TEMPLATE_GLOBAL_SCOPE());
                            break;
                        case 'VariableDeclarator':
                            console.log('entering vardec');
                            var variableDeclaration = TEMPLATE_VARIABLE_DECLARATION(node.name, node.init);
                            scopeQueue[scopeQueue.length - 1].declared_variables.push(variableDeclaration);
                            break;
                        case 'AssignmentExpression':
                            var left = node.left;
                            var right = node.right;
                            var operator = node.operator;
                            var assignment = TEMPLATE_VARIABLE_ASSIGNMENT(left, right, operator);
                            scopeQueue[scopeQueue.length - 1].assigned_variables.push(assignment);
                            break;
                        case 'FunctionDeclaration':
                            var newScope = TEMPLATE_SCOPE();
                            scopeQueue.push(newScope);
                            console.log('entering function');
                            break;
                        case 'BlockStatement':
                            console.log('entering block');
                            break;
                        default:
                            break;
                    }
                },
                leave: function(node) {
                    switch(node.type){
                        case 'FunctionDeclaration':
                            lastScope = scopeQueue.pop();
                            scopeQueue[scopeQueue.length - 1].scopes.push(lastScope);
                            console.log('exiting function');
                            break;
                        default:
                            break;
                    }
                }
            }
        );
        return scopeQueue.pop();
    }

    var ast = generateAST.astFromFile('../test/ast_tests/source_in_function.js');
    console.log(constructScope(ast));
    return {
        constructScope: constructScope
    }
}();