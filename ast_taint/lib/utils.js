/**
 * Created by dimitri on 15/05/2017.
 */
var estraverse = require('estraverse');

var ASTManipulations = (function () {

    var reduceBoolean = function (acc, val) {
        return acc || val;
    };

    var memberExpressionCheck = function (node, identifier, property) {
        if (node.object.type === 'MemberExpression') {
            return memberExpressionCheck(node.object, identifier, property);
        }
        return node.object.name.match(identifier)
            && (node.property.name === property
            || node.property.value === property);
    }

    var hasProperty = function (node, name) {
        return node.property.name === name;
    }

    //Curried
    var isOfType = function (type) {
        return function (node) {
            return type === node.type;
        }
    }

    var findMemberExpression = function (node) {
        var isMemberExpression = isOfType('MemberExpression');

        if (isMemberExpression(node)) {
            return node;
        }
    }

    var findDeclaration = function (node) {
        var isDeclaration = isOfType('VariableDeclarator');

        if (isDeclaration(node)) {
            return node;
        }
    }

    var collectDeclarations = function (ast) {
        var declarations = mapFunctionToNodes(ast, findDeclaration);
        return declarations.filter(node => node);
    }

    var collectMemberExpressions = function (ast) {
        var memberExpressions = mapFunctionToNodes(ast, findMemberExpression);
        return memberExpressions.filter(node => node);//Not sure of this filter
    }

    var mapFunctionToNodes = function (ast, curryFunction) {
        var arr = [];
        estraverse.traverse(ast, {
            enter: function (node) {
                arr.push(curryFunction(node));
            }
        });
        return arr;
    }

    return {
        memberExpressionCheck: memberExpressionCheck,
        hasProperty: hasProperty,
        mapFunctionToNodes: mapFunctionToNodes,
        isOfType: isOfType,
        collectMemberExpressions: collectMemberExpressions,
        collectDeclarations: collectDeclarations,
        reduceBoolean: reduceBoolean
    }

})();

module.exports = ASTManipulations;