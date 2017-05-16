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

    return {
        memberExpressionCheck: memberExpressionCheck,
        hasProperty: hasProperty
    }

})();

module.exports = ASTManipulations;