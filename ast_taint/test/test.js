/**
 * Created by dimitri on 11/05/2017.
 */
let chai = require('chai'),
  expect = chai.expect, // we are using the "expect" style of Chai
  sourceFind = require('../lib/SourceFinder'),
  sinkFinder = require('../lib/SinkFinder'),
  astCheck = require('../lib/Utils'),
  GenerateAST = require('../lib/GenerateAST'),
  scopeAnalysis = require('../lib/Scope');

const documentValue = JSON.parse(`{
    "type": "MemberExpression",
    "computed": false,
    "object": {
    "type": "CallExpression",
        "callee": {
        "type": "MemberExpression",
            "computed": false,
            "object": {
            "type": "Identifier",
                "name": "document"
        },
        "property": {
            "type": "Identifier",
                "name": "getElementById"
        }
    },
    "arguments": [
        {
            "type": "Identifier",
            "name": "element"
        }
    ]
},
    "property": {
    "type": "Identifier",
        "name": "value"
}
}`);

const messageManagerControl = JSON.parse(`{
            "type": "VariableDeclaration",
            "declarations": [
                {
                    "type": "VariableDeclarator",
                    "id": {
                        "type": "Identifier",
                        "name": "cpmm"
                    },
                    "init": {
                        "type": "CallExpression",
                        "callee": {
                            "type": "MemberExpression",
                            "computed": false,
                            "object": {
                                "type": "MemberExpression",
                                "computed": true,
                                "object": {
                                    "type": "Identifier",
                                    "name": "Cc"
                                },
                                "property": {
                                    "type": "Literal",
                                    "value": "@mozilla.org/childprocessmessagemanager;1",
                                    "raw": "@mozilla.org/childprocessmessagemanager;1"
                                }
                            },
                            "property": {
                                "type": "Identifier",
                                "name": "getService"
                            }
                        },
                        "arguments": [
                            {
                                "type": "MemberExpression",
                                "computed": false,
                                "object": {
                                    "type": "Identifier",
                                    "name": "Ci"
                                },
                                "property": {
                                    "type": "Identifier",
                                    "name": "nsISyncMessageSender"
                                }
                            }
                        ]
                    }
                }
            ],
            "kind": "let"
        }`);

describe('AST generation', () => {
  describe('Collecting all javascript files', () => {
    it('Can\'t find non-existing paths', () => {
      const falsePath = '';
      const value = GenerateAST.collectFiles(falsePath);
      expect(value).to.be.empty;
    });
    it('finds all files with the javascript extension', () => {
      const path = '../';
      const value = GenerateAST.collectFiles(path);
      expect(value.length).to.be.at.least(5);
    });
  });
  describe('Creates an AST', () => {
    it('Creates an AST from one file', () => {
      const path = './test/ast_tests/';
      const ast = GenerateAST.createAST(path);
      expect(ast).to.not.be.undefined;
    });
  });
});

describe('AST node analysis', () => {
  it('finds a specific member access expression', () => {
    const memberNode = messageManagerControl.declarations[0].init.arguments[0];
    const value = astCheck.memberExpressionCheck(memberNode, '', 'nsISyncMessageSender');
    expect(value).to.equal(true);
  });
  it('checks whether the first node in the AST is Program', () => {
    const ast = GenerateAST.astFromFile('test/ast_tests/one_assignment.js');
    const typeArray = astCheck.mapFunctionToNodes(ast, astCheck.isOfType('Program'));
    expect(typeArray[0]).to.be.true;
  });
  it('finds all member expressions in the ast', () => {
    const ast = GenerateAST.astFromFile('test/ast_tests/member_expression.js');
    const memberExpression = astCheck.collectMemberExpressions(ast);
    expect(memberExpression).to.have.lengthOf(1);
  });
  it('finds all variable variable_declarations', () => {
    const ast = GenerateAST.astFromFile('test/ast_tests/one_assignment.js');
    const declaration = astCheck.collectDeclarations(ast);
    expect(declaration).to.have.lengthOf(1);
  });
});

describe('Vulnerablility finder', () => {
  describe('Document sources', () => {
    it('finds the sources when doing a member call on documents', () => {
      const value = sourceFind.checkMemberAccess(documentValue);
      expect(value).to.equal(true);
    });

    it('finds the document.URL source', () => {
      const docURLAST = GenerateAST.astFromFile('test/ast_tests/member_expression.js');
      const normalAST = GenerateAST.astFromFile('test/ast_tests/member_access.js');

      const docMemberExpressions = astCheck.collectMemberExpressions(docURLAST);
      const normalMemberExpressions = astCheck.collectMemberExpressions(normalAST);

      const foundSource = docMemberExpressions.map(sourceFind.generalCheck);
      const noFoundSource = normalMemberExpressions.map(sourceFind.generalCheck);

      expect(true).to.be.oneOf(foundSource);
      expect(true).to.not.be.oneOf(noFoundSource);
    });
    it('finds the value of a document element source', () => {
      const ast = GenerateAST.astFromFile('test/ast_tests/value_access.js');
      const declarations = astCheck.collectDeclarations(ast);
      const foundSource = declarations.map(sourceFind.checkDeclaration);
      expect(true).to.be.oneOf(foundSource);
    });
    it('finds a source within a function', () => {
      const ast = GenerateAST.astFromFile('test/ast_tests/source_in_function.js');
      const declarations = astCheck.collectDeclarations(ast);
      const foundSource = declarations.map(sourceFind.checkDeclaration);
      expect(true).to.be.oneOf(foundSource);
    });
  });
  describe('Potential communication sinks', () => {
    it('checks whether a property exists', () => {
      const memberNode = messageManagerControl.declarations[0].init.callee;
      const value = astCheck.memberExpressionCheck(memberNode, '', '@mozilla.org/childprocessmessagemanager;1');
      expect(value).to.equal(true);
    });
    it('finds the identifier of the message manager', () => {
      const value = sinkFinder.findProcessMessageManager(messageManagerControl.declarations[0]);
      expect(value).to.equal('cpmm');
    });
    it('finds the message passing functions', () => {
      const value = sinkFinder.checkMessageFunction();
    });
  });
});

describe('Scope Analysis', () => {
  it('can find a source within the global scope', () => {
    const ast = GenerateAST.astFromFile('test/ast_tests/scoped_source_reassign.js');
    const sources = scopeAnalysis.sourcesInGlobalScope(ast);
    expect(sources).to.have.lengthOf(1);
  });
  it('can find all sources within a file', () => {
    const ast = GenerateAST.astFromFile('test/ast_tests/scoped_sources.js');
    const sources = scopeAnalysis.sourcesInFile(ast);
    expect(sources).to.have.lengthOf(3);// TODO changeme
  });
  it('can find functions returning a source', () => {
    const ast = GenerateAST.astFromFile('test/ast_tests/function_returns_source.js');
    const functionScope = scopeAnalysis.createScope(ast).scopes[1];
    const returnedSource = scopeAnalysis.functionReturnsSource(functionScope);
    expect(returnedSource).to.be.true;
  });
});

