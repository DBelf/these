/**
 * Created by dimitri on 11/05/2017.
 */
var astCheck = require('./ast_manipulations');

//Arrays with the vulnerable member accesses
var documentSources = ['URL', 'documentURI', 'URLUnencoded', 'baseURI', 'cookie', 'referrer'];
var locationSources = ['href', 'search', 'hash', 'pathname'];

//Source access strings
const VALUE_ACCESS_STRING = 'value';
const DATA_ACCESS_STRING = 'data';
const NAME_ACCESS_STRING = 'name';

function valueAccess(node) {
    return astCheck.hasProperty(node, VALUE_ACCESS_STRING);
}

function dataAccess(node) {
    return astCheck.hasProperty(node, DATA_ACCESS_STRING);
}

function nameAccess(node) {
    return astCheck.hasProperty(node, NAME_ACCESS_STRING);
}

function generalCheck(node) {
    //sanity check
    switch (node.object.name) {
        case 'document':
            return checkForSource(node, 'document', documentSources);
        case 'location':
            return checkForSource(node, 'location', locationSources);
        default:
            return false;
    }
}

function checkForSource(node, callee, sourceArray) {
    var potentialSources = sourceArray.map(function (sourceName) {
        return astCheck.memberExpressionCheck(node, callee, sourceName);
    });
    return potentialSources.reduce(function (acc, val) {
        return acc || val;
    }, false);
}

exports.generalCheck = generalCheck;
exports.valueAccess = valueAccess;
exports.dataAccess = dataAccess;
exports.nameAccess = nameAccess;