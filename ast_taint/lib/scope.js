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
            'scopes': scopes || []
        }
    }

    var TEMPLATE_SCOPE = function (identifiers, scopes) {
        return {
            'declared_variables': identifiers || [],
            'scopes': scopes
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
        var currentScope;

        estraverse.traverse(ast, {
                enter: function (node) {
                    switch (node.type) {
                        case 'Program':
                            currentScope = TEMPLATE_GLOBAL_SCOPE();
                            break;
                        case 'VariableDeclarator':
                            var variableDeclaration = TEMPLATE_VARIABLE_DECLARATION(node.name, node.init);
                            currentScope.declared_variables.push(variableDeclaration);
                            break;
                    }
                }

            }
        );
        return currentScope;
    }

    var ast = generateAST.astFromFile('../test/ast_tests/one_assignment.js');
    console.log(constructScope(ast));
    return {
        constructScope: constructScope
    }
}();