/**
 * Created by dimitri on 11/05/2017.
 */
var astCheck = require('./ast_manipulations');

var SourceFinder = (function () {
    //Source access strings
    const _VALUE_ACCESS_STRING = 'value';
    const _DATA_ACCESS_STRING = 'data';
    const _NAME_ACCESS_STRING = 'name';

    //Arrays with the vulnerable member accesses
    var _documentSources = ['URL', 'documentURI', 'URLUnencoded', 'baseURI', 'cookie', 'referrer'];
    var _locationSources = ['href', 'search', 'hash', 'pathname'];

    var valueAccess = function (node) {
        return astCheck.hasProperty(node, _VALUE_ACCESS_STRING);
    }

    var dataAccess = function (node) {
        return astCheck.hasProperty(node, _DATA_ACCESS_STRING);
    }

    var nameAccess = function (node) {
        return astCheck.hasProperty(node, _NAME_ACCESS_STRING);
    }

    var generalCheck = function (node) {
        //sanity check
        switch (node.object.name) {
            case 'document':
                return checkForSource(node, 'document', _documentSources);
            case 'location':
                return checkForSource(node, 'location', _locationSources);
            default:
                return false;
        }
    }

    var checkForSource = function (node, callee, sourceArray) {
        var potentialSources = sourceArray.map(function (sourceName) {
            return astCheck.memberExpressionCheck(node, callee, sourceName);
        });
        return potentialSources.reduce(function (acc, val) {
            return acc || val;
        }, false);
    }

    return {
        valueAccess: valueAccess,
        dataAccess: dataAccess,
        nameAccess: nameAccess,
        generalCheck: generalCheck
    }

})();

module.exports = SourceFinder;