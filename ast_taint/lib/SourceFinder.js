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

  const SOURCE_TEMPLATE = function (identifier, type, loc) {
    return {
      identifier,
      type,
      loc,
    };
  };

  const DECLARED_SOURCE = function (identifier, loc) {
    return SOURCE_TEMPLATE(identifier, 'VariableDeclarator', loc);
  };

  const ASSIGNED_SOURCE = function (identifier, loc) {
    return SOURCE_TEMPLATE(identifier, 'Assigned', loc);
  };

  const FUNCTION_SOURCE = function (identifier, sources, loc) {
    const source = SOURCE_TEMPLATE(identifier, 'FunctionDeclaration', loc);
    source.sources = sources;
    return source;
  };

  const checkForSource = function (node, callee, potentialSources) {
    const sources = potentialSources.filter((potential) => {
      const source = Utils.memberExpressionCheck(node, callee, potential);
      return source;
    });
    return sources.length > 0;
  };

  const checkMemberAccess = function (node) {
    const valueAccessed = ACCESS_STRINGS.filter(string => Utils.hasProperty(node, string));
    return valueAccessed.length > 0;
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

  const returnAccessesSource = function (node) {
    return checkMemberAccess(node.argument);
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

  return {
    checkMemberAccess,
    ASSIGNED_SOURCE,
    DECLARED_SOURCE,
    FUNCTION_SOURCE,
    generalCheck,
    checkDeclaration,
    returnAccessesSource,
  };
}());

module.exports = SourceFinder;
