/**
 * Created by dimitri on 11/05/2017.
 */
var chai = require('chai'),
    expect = chai.expect, // we are using the "expect" style of Chai
    sourceFind = require('../lib/source_finder'),
    sinkFinder = require('../lib/sink_finder'),
    astCheck = require('../lib/ast_manipulations'),
    generateAST = require('../lib/generate_ast');

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

var valueAccessNode = JSON.parse(`
{
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
                    "type": "Literal",
                    "value": "??",
                    "raw": "??"
                }
            ]
        },
        "property": {
            "type": "Identifier",
            "name": "value"
        }
    }
`);

var documentMemberAccess = JSON.parse(`
                    {
                        "type": "MemberExpression",
                        "computed": false,
                        "object": {
                            "type": "Identifier",
                            "name": "document"
                        },
                        "property": {
                            "type": "Identifier",
                            "name": "URLUnencoded"
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

describe('Vulnerablility finder', function () {
    describe('Document sources', function () {
        it('finds the sources when doing a member call on documents', function () {
            var value = sourceFind.valueAccess(documentValue);
            expect(value).to.equal(true);
        });
        it('finds a document source', function () {
            var value = sourceFind.generalCheck(documentMemberAccess);
            expect(value).to.equal(true);
        });
        it('finds the value of a document element source', function () {
            var value = sourceFind.valueAccess(valueAccessNode);
            expect(value).to.equal(true);
        });
    });
    describe('Potential communication sinks', function () {
        it('checks whether a property exists', function () {
            var memberNode = messageManagerControl.declarations[0].init.callee;
            var value = astCheck.memberExpressionCheck(memberNode, 'Cc', '@mozilla.org/childprocessmessagemanager;1');
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

describe('AST node analysis', function () {
    it('finds a specific member access expression', function () {
        var memberNode = messageManagerControl.declarations[0].init.arguments[0];
        var value = astCheck.memberExpressionCheck(memberNode, 'Ci', 'nsISyncMessageSender');
        expect(value).to.equal(true);
    });
    it('checks whether the first node in the AST is Program', function () {
        var ast = generateAST.astFromFile('test/ast_tests/one_assignment.js');
        var typeArray = astCheck.mapFunctionToNodes(ast, astCheck.isOfType('Program'));
        expect(typeArray[0]).to.be.true;
    });
    it('finds all memberexpressions in the ast', function () {
        var ast = generateAST.astFromFile('test/ast_tests/member_expression.js');
        var memberExpression = astCheck.collectMemberExpressions(ast);
        expect(memberExpression).to.have.lengthOf(1);
    });
});



