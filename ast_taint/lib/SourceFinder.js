/**
 * Created by dimitri on 11/05/2017.
 */
const Utils = require('./Utils');

const SourceFinder = (function sourceFinder() {
    // Source access strings
  const accessStrings = ['value', 'data', 'name'];
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

    // Checks whether the statement points to the source.
    sourcePointsTo(statement) {
      switch (statement.type) {
        case 'VariableDeclarator':
          return this.pointsToDeclaration(statement);
        case 'ExpressionStatement':
          return this.pointsToExpression(statement);
          // TODO add checks for passing to functions/Anything else.
        default:
          return [];
      }
    }

    // Returns whether the declaration points to the source.
    pointsToDeclaration(declaration) {
      return Utils.declarationPointsTo(declaration, this.identifier) ?
        new SourceFinder.DeclaredSource(declaration.id.name, declaration.loc) : [];
    }

    // Returns whether the expression points to the source.
    pointsToExpression(expression) {
      return Utils.assignmentPointsTo(expression.expression, this.identifier) ?
        new SourceFinder.AssignedSource(expression.expression.left.name, expression.loc) : [];
    }

    // Returns what statements the source is used in.
    isUsedIn(statements) {
      return statements.reduce((acc, statement) => acc.concat(this.sourcePointsTo(statement)), []);
    }
  }

  // Declaration source wrapper.
  class DeclaredSource extends Source {
    constructor(identifier, loc) {
      super(identifier, 'VariableDeclarator', loc);
    }
  }

  // Assignment source wrapper.
  class AssignedSource extends Source {
    constructor(identifier, loc) {
      super(identifier, 'AssignedVariable', loc);
    }
  }

  class AccessedSource extends Source {
    constructor(identifier, loc) {
      super(identifier, 'AccessedSource', loc);
    }
  }
  // Function source wrapper, used to check where it is used.
  class FunctionSource extends Source {
    constructor(identifier, sources, loc) {
      super(identifier, 'FunctionDeclaration', loc);
      this.sources = sources;
    }

    // Used to check what statements call the function.
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

    // Returns whether an expression calls the function.
    calledByExpression(expression) {
      return Utils.assignmentCalls(expression.expression, this.identifier) ?
        new SourceFinder.AssignedSource(expression.expression.left.name, expression.loc) : [];
    }

    // Returns whether a declaration calls the function.
    calledByDeclaration(declaration) {
      return Utils.declarationCalls(declaration, this.identifier) ?
        new SourceFinder.DeclaredSource(declaration.id.name, declaration.loc) : [];
    }

    // Returns what statements call (or invoke) the function.
    isCalledBy(statements) {
      return statements.reduce((acc, statement) => acc.concat(this.sourceCalls(statement)), []);
    }
  }

  // Used to check a memberaccess for any type of source vulnerability.
  const checkForSource = function (node, callee, potentialSources) {
    const sources = potentialSources.filter(potential => (
     Utils.memberExpressionCheck(node, callee, potential)));
    return sources.length > 0;
  };

  // Checks whether the member access statement is vulnerable.
  const checkMemberAccess = function (node) {
    const valueAccessed = accessStrings.filter(string => Utils.hasProperty(node, string));
    return valueAccessed.length > 0;
  };

  /*
   * A general check that can be used to check either a declaration or an
   * expression for vulnerabilities.
   */
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

  // Checks whether the returnstatement returns a vulnerable memberaccess.
  const returnAccessesSource = function (returnStatement) {
    return checkMemberAccess(returnStatement.argument);
  };

  // Checks whether the declaration is a source.
  const checkDeclaration = function (declaration) {
    if (declaration.init === null) {
      return false;
    }
    switch (declaration.init.type) {
      case 'MemberExpression':
        // Not sure if i can just include the value access here
        return generalCheck(declaration.init) || checkMemberAccess(declaration.init);
      default:
        return false;
    }
  };

  return {
    checkMemberAccess,
    AssignedSource,
    DeclaredSource,
    AccessedSource,
    FunctionSource,
    generalCheck,
    checkDeclaration,
    returnAccessesSource,
  };
}());

module.exports = SourceFinder;
