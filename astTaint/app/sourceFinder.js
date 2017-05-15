/**
 * Created by dimitri on 11/05/2017.
 */
var astCheck = require('./ast_manipulations');
var documentSources = ['URL', 'documentURI', 'URLUnencoded', 'baseURI', 'cookie', 'referrer'];
var valueAccessString = 'value';

exports.memberExpressionCheck = function (node) {
    if (node.object.callee) {
        var documentElementValue = node.object.callee.object.name === 'document' &&
            true;

        var fromValue = node.property.name === 'value';
        return (documentElementValue || fromValue);

    }
    return false;
};

function valueAccess(node) {
    return astCheck.hasProperty(node, valueAccessString);
}

function documentChecks(node) {
    //sanity check
        var potentialSources = documentSources.map(function (sourceName) {
            return astCheck.memberExpressionCheck(node, 'document', sourceName);
        });
        return potentialSources.reduce(function (acc, val) {
            return acc || val;
        }, false);
}

exports.documentChecks = documentChecks;
exports.valueAccess = valueAccess;
