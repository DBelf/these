/**
 * Created by dimitri on 15/05/2017.
 */


memberExpressionCheck = function(node, identifier, property) {
    if (node.object.type === 'MemberExpression'){
        return memberExpressionCheck(node.object, identifier, property);
    }
    return node.object.name === identifier && (node.property.name === property || node.property.value === property);
}

exports.hasProperty = function (node, name){
    if(node.type === 'CallExpression'){
        return node.callee.object.property.value === name;
    }
    return false;
}

exports.memberExpressionCheck = memberExpressionCheck;