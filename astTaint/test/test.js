/**
 * Created by dimitri on 11/05/2017.
 */
var chai = require('chai');
var expect = chai.expect; // we are using the "expect" style of Chai
var sourceFind = require('../app/sourceFinder');
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

describe("Vulnerable source finder", function(){
    describe("Document sources", function () {
       it("finds the sources when doing a member call on documents", function () {
           var value = sourceFind.memberExpressionCheck(documentValue);
           expect(value).to.equal(true);
       });
    });
});



