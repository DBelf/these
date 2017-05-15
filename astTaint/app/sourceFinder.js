/**
 * Created by dimitri on 11/05/2017.
 */

exports.memberExpressionCheck = function(node){
    if(node.object.callee) {
        var documentElementValue = node.object.callee.object.name === 'document' &&
            true;

        var fromValue = node.property.name === 'value';
        return (documentElementValue || fromValue);

    }
    return false;
};


