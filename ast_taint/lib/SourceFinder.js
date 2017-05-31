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


  // Abstract class for all source types.
  class Source {
    constructor(identifier, type, loc) {
      this.identifier = identifier;
      this.type = type;
      this.loc = loc;
    }

    sourcePointsTo(statement) {
      switch (statement.type) {
        case 'VariableDeclarator':
          return this.pointsToDeclaration(statement);
        case 'ExpressionStatement':
          return this.pointsToExpression(statement);
        default:
          return [];
      }
    }

    pointsToDeclaration(declaration) {
      return Utils.declarationPointsTo(declaration, this.identifier) ?
        new SourceFinder.DeclaredSource(declaration.id.name, declaration.loc) : [];
    }

    pointsToExpression(expression) {
      return Utils.assignmentPointsTo(expression.expression, this.identifier) ?
        new SourceFinder.AssignedSource(expression.expression.left.name, expression.loc) : [];
    }

    isUsedIn(statements) {
      return statements.reduce((acc, statement) => acc.concat(this.sourcePointsTo(statement)), []);
    }
  }

  class DeclaredSource extends Source {
    constructor(identifier, loc) {
      super(identifier, 'VariableDeclarator', loc);
    }
  }

  class AssignedSource extends Source {
    constructor(identifier, loc) {
      super(identifier, 'AssignedVariable', loc);
    }
  }

  class FunctionSource extends Source {
    constructor(identifier, sources, loc) {
      super(identifier, 'FunctionDeclaration', loc);
      this.sources = sources;
    }

    sourceCalls(statement) {
      switch (statement.type) {
        case 'VariableDeclaration':
          return statement.declarations.reduce((acc, declaration) => (
            acc.concat(this.calledByDeclaration(declaration))), []);
        case 'ExpressionStatement':
          return this.calledByExpression(statement);
        default:
          return [];
      }
    }

    calledByExpression(expression) {
      return Utils.assignmentCalls(expression.expression, this.identifier) ?
        new SourceFinder.AssignedSource(expression.expression.left.name, expression.loc) : [];
    }

    calledByDeclaration(declaration) {
      return Utils.declarationCalls(declaration, this.identifier) ?
        new SourceFinder.DeclaredSource(declaration.id.name, declaration.loc) : [];
    }

    isCalledBy(statements) {
      return statements.reduce((acc, statement) => acc.concat(this.sourceCalls(statement)), []);
    }
  }

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
    AssignedSource,
    DeclaredSource,
    FunctionSource,
    generalCheck,
    checkDeclaration,
    returnAccessesSource,
  };
}());

module.exports = SourceFinder;
