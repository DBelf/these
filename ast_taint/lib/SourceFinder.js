/**
 * Created by dimitri on 11/05/2017.
 */
const Utils = require('./Utils');

const SourceFinder = (function sourceFinder() {
    // Source access strings
  const ACCESS_STRINGS = ['value', 'data', 'name'];
    // Arrays with the vulnerable member accesses
  const documentSources = ['URL', 'documentURI', 'URLUnencoded', 'baseURI', 'cookie', 'referrer'];
  const locationSources = ['href', 'search', 'hash', 'pathname'];

  const checkForSource = function (node, callee, potentialSources) {
    const sources = potentialSources.filter((potential) => {
      const source = Utils.memberExpressionCheck(node, callee, potential);
      return source;
    });
    return sources.length > 0;
  };

  const generalCheck = function (node) {
    switch (node.object.name) {
      case 'document':
        return checkForSource(node, 'document', documentSources);
      case 'location':
        return checkForSource(node, 'location', locationSources);
      default:
        return checkMemberAccess(node);
    }
  };

  const checkMemberAccess = function (node) {
    const valueAccessed = ACCESS_STRINGS.filter(string => Utils.hasProperty(node, string));
    return valueAccessed.length > 0;
  };

  const checkDeclaration = function (node) {
    if (node.init === null) {
      return false;
    }
    switch (node.init.type) {
      case 'MemberExpression':
        // Not sure if i can just include the value access here
        return generalCheck(node.init) || checkMemberAccess(node.init);
      default:
        return false;
    }
  };

  const returnsSource = function (node, identifier) {
    if (typeof identifier !== 'undefined') {
      return node.argument.name === identifier;
    }
    return false;
  };


  return {
    checkMemberAccess,
    generalCheck,
    checkDeclaration,
  };
}());

module.exports = SourceFinder;
