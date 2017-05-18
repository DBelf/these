/**
 * Created by dimitri on 15/05/2017.
 */

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

    var isOfType = function (type, node){
        return node.type === type;
    }

    var mapFunctionToNodes = function (ast, fun) {
        var arr = [];
        estraverse.traverse(ast, {
            enter: function (fun) {
                arr.append(fun(node));
            },
            exit: function (node) {
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