/**
 * Created by dimitri on 15/05/2017.
 */

memberExpressionCheck = function (node, identifier, property) {
    if (node.object.type === 'MemberExpression') {
        return memberExpressionCheck(node.object, identifier, property);
    }
    return node.object.name.match(identifier) && (node.property.name === property || node.property.value === property);
}

exports.hasProperty = function (node, name) {
    return node.property.name === name;
}

exports.memberExpressionCheck = memberExpressionCheck;