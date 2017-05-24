/**
 * Created by dimitri on 11/05/2017.
 */
var astCheck = require('./utils');

var SourceFinder = (function () {
    //Source access strings
    const _VALUE_ACCESS_STRING = 'value';
    const _DATA_ACCESS_STRING = 'data';
    const _NAME_ACCESS_STRING = 'name';
    const _ACCESS_STRINGS = ['value', 'data', 'name'];
    //Arrays with the vulnerable member accesses
    var _documentSources = ['URL', 'documentURI', 'URLUnencoded', 'baseURI', 'cookie', 'referrer'];
    var _locationSources = ['href', 'search', 'hash', 'pathname'];

    var TEMPLATE_SOURCE = function (id, original_type, location) {
        return {
            'id': id,
            'type': original_type,
            'loc': location
        }
    }

    var valueAccess = function (node) {
        return astCheck.hasProperty(node, _VALUE_ACCESS_STRING);
    }

    var dataAccess = function (node) {
        return astCheck.hasProperty(node, _DATA_ACCESS_STRING);
    }

    var nameAccess = function (node) {
        return astCheck.hasProperty(node, _NAME_ACCESS_STRING);
    }

    var checkMemberAccess = function (node) {
        var valueAccessed = _ACCESS_STRINGS.map(function (string) {
            return astCheck.hasProperty(node, string);
        });
        return valueAccessed.reduce(astCheck.reduceBoolean, false);
    }

    var checkDeclaration = function (node) {
        if (node.init === null) {
            return false;
        }
        switch (node.init.type) {
            case 'MemberExpression':
                //Not sure if i can just include the value access here
                return generalCheck(node.init) || checkMemberAccess(node.init);
            default:
                return false;
        }
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
        return potentialSources.reduce(astCheck.reduceBoolean, false);
    }

    return {
        checkMemberAccess: checkMemberAccess,
        generalCheck: generalCheck,
        checkDeclaration: checkDeclaration
    }

})();

module.exports = SourceFinder;