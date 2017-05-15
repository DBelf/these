/**
 * Created by dimitri on 11/05/2017.
 */
var chai = require('chai');
var expect = chai.expect; // we are using the "expect" style of Chai
var sourceFind = require('../app/sourceFinder');
var sinkFind = require('../app/sinkFinder');

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

describe("Vulnerablility finder", function(){
    describe("Document sources", function () {
       it("finds the sources when doing a member call on documents", function () {
           var value = sourceFind.memberExpressionCheck(documentValue);
           expect(value).to.equal(true);
       });
    });
    describe("Potential communication sinks", function () {
        it("checks whether a property exists", function(){
            var memberNode = messageManagerControl.declarations[0].init.callee.object;
            var value = sinkFind.memberExpressionCheck(memberNode, "Cc", "@mozilla.org/childprocessmessagemanager;1");
            expect(value).to.equal(true);
        });
       it("finds the parts where the process takes hold of a message manager", function (){
           var value = sinkFind.communicationManagerCheck(messageManagerControl);
           expect(value).to.equal(true);
       })
    });
});

describe("AST node analysis", function(){
    it("finds a specific member access expression", function(){
        var memberNode = messageManagerControl.declarations[0].init.arguments[0];
        var value = sinkFind.memberExpressionCheck(memberNode, "Ci", "nsISyncMessageSender");
        expect(value).to.equal(true);
    })
});



