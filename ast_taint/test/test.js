/**
 * Created by dimitri on 11/05/2017.
 */
var chai = require('chai'),
    expect = chai.expect, // we are using the "expect" style of Chai
    sourceFind = require('../lib/source_finder'),
    sinkFinder = require('../lib/sink_finder'),
    astCheck = require('../lib/utils'),
    generateAST = require('../lib/generate_ast'),
    scopeAnalysis = require('../lib/scope');

var documentValue = JSON.parse(`{
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

var messageManagerControl = JSON.parse(`{
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

describe('AST generation', function () {
    describe('Collecting all javascript files', function () {
        it('Can\'t find non-existing paths', function () {
            var falsePath = ''
            var value = generateAST.collectFiles(falsePath);
            expect(value).to.be.undefined;
        })
        it('finds all files with the javascript extension', function () {
            var path = '../';
            var value = generateAST.collectFiles(path);
            expect(value.length).to.be.at.least(5);
        })
    })
    describe('Creates an AST', function () {
        it('Creates an AST from one file', function () {
            var path = './test/ast_tests/';
            var ast = generateAST.createAST(path);
            expect(ast).to.not.be.undefined;
        })
    })
})

describe('AST node analysis', function () {
    it('finds a specific member access expression', function () {
        var memberNode = messageManagerControl.declarations[0].init.arguments[0];
        var value = astCheck.memberExpressionCheck(memberNode, '', 'nsISyncMessageSender');
        expect(value).to.equal(true);
    });
    it('checks whether the first node in the AST is Program', function () {
        var ast = generateAST.astFromFile('test/ast_tests/one_assignment.js');
        var typeArray = astCheck.mapFunctionToNodes(ast, astCheck.isOfType('Program'));
        expect(typeArray[0]).to.be.true;
    });
    it('finds all member expressions in the ast', function () {
        var ast = generateAST.astFromFile('test/ast_tests/member_expression.js');
        var memberExpression = astCheck.collectMemberExpressions(ast);
        expect(memberExpression).to.have.lengthOf(1);
    });
    it ('finds all variable variable_declarations', function () {
        var ast = generateAST.astFromFile('test/ast_tests/one_assignment.js');
        var declaration = astCheck.collectDeclarations(ast);
        expect(declaration).to.have.lengthOf(1);
    })
});

describe('Vulnerablility finder', function () {
    describe('Document sources', function () {
        it('finds the sources when doing a member call on documents', function () {
            var value = sourceFind.valueAccess(documentValue);
            expect(value).to.equal(true);
        });

        it('finds the document.URL source', function () {
            var docURLAST = generateAST.astFromFile('test/ast_tests/member_expression.js');
            var normalAST = generateAST.astFromFile('test/ast_tests/member_access.js');

            var docMemberExpressions = astCheck.collectMemberExpressions(docURLAST);
            var normalMemberExpressions = astCheck.collectMemberExpressions(normalAST);

            var foundSource = docMemberExpressions.map(sourceFind.generalCheck);
            var noFoundSource = normalMemberExpressions.map(sourceFind.generalCheck);

            expect(true).to.be.oneOf(foundSource);
            expect(true).to.not.be.oneOf(noFoundSource);
        });
        it('finds the value of a document element source', function () {
            var ast = generateAST.astFromFile('test/ast_tests/value_access.js');
            var declarations = astCheck.collectDeclarations(ast);
            var foundSource = declarations.map(sourceFind.checkDeclaration);
            expect(true).to.be.oneOf(foundSource);
        });
        it('finds a source within a function', function () {
            var ast = generateAST.astFromFile('test/ast_tests/source_in_function.js');
            var declarations = astCheck.collectDeclarations(ast);
            var foundSource = declarations.map(sourceFind.checkDeclaration);
            expect(true).to.be.oneOf(foundSource);
        })
    });
    describe('Potential communication sinks', function () {
        it('checks whether a property exists', function () {
            var memberNode = messageManagerControl.declarations[0].init.callee;
            var value = astCheck.memberExpressionCheck(memberNode, '', '@mozilla.org/childprocessmessagemanager;1');
            expect(value).to.equal(true);
        });
        it('finds the identifier of the message manager', function () {
            var value = sinkFinder.findProcessMessageManager(messageManagerControl.declarations[0]);
            expect(value).to.equal('cpmm');
        })
        it('finds the message passing functions', function () {
            var value = sinkFinder.checkMessageFunction();
        })
    });
});

describe('Scope Analysis', function () {
    it('can find a reassigned source within the scope', function () {
        var ast = generateAST.astFromFile('test/ast_tests/scoped_source_reassign.js');
        var sources = scopeAnalysis.analyzeScope(ast);
        expect(sources).to.have.lengthOf(2);
        expect(sources[0]).to.have.lengthOf(1);
        expect(sources[1]).to.have.lengthOf(3);
    })
})



