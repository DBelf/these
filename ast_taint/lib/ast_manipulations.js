/**
 * Created by dimitri on 15/05/2017.
 */
var estraverse = require('estraverse');

var ASTManipulations = (function () {

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

    var isOfType = function (type){
        return function (node) {
            return type === node.type;
        }
    }

    var mapFunctionToNodes = function (ast, curryFunction) {
        var arr = [];
        estraverse.traverse(ast, {
            enter: function (node) {
                arr.push(curryFunction(node));
                // arr.append(fun(node));
            }
        })
        return arr;
    }

    return {
        memberExpressionCheck: memberExpressionCheck,
        hasProperty: hasProperty,
        mapFunctionToNodes: mapFunctionToNodes,
        isOfType: isOfType
    }

})();

module.exports = ASTManipulations;