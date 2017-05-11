/*
 * Copyright (c) 2012 Sergej Tatarincev
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of
 * the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 * CONTRACT, TORT OR OTHERWISE , ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */
var fs = require('fs'),
    esprima = require('esprima'),
    esgraph = require('esgraph'),
    estraverse = require('estraverse');


var scopeQueue = [];

function traverse(node, func) {
    func(node);
    for (var key in node) {
        if (node.hasOwnProperty(key)) {
            var child = node[key];
            if (typeof child === 'object' && child !== null) {

                if (Array.isArray(child)) {
                    child.forEach(function(node) {
                        traverse(node, func);
                    });
                } else {
                    traverse(child, func);
                }
            }
        }
    }
}

function newScopeLevel(node){
    return node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression'
        || node.type === 'Program';
}


function memberExpressionCheck(node){
    if(node.object.callee) {
        return (node.object.callee.object.name === 'document' &&
        node.object.callee.property.name === 'getElementById' &&
        node.property.name === 'value');

    }
    return false;
}

function isSource(node){
    switch(node.type) {
        case 'VariableDeclarator':
            if(printDeclaration(node)){
                console.log('found stuff');
            }
            break;
        default:
            break;
    }
}


function tagSource(node) {
    switch (node.type) {
        case 'MemberExpression':
            node.isSource = memberExpressionCheck(node);
            break;
        default:
            break;
    }
}

function printDeclaration(node) {
    return node.init.type === 'MemberExpression';
}

function printType(node) {
    // isSource(node);
    console.log(node.type);

}

function initScope(ast){
    estraverse.traverse(ast, {
        enter: enterNode,
        leave: leaveNode
    });
}

function enterNode(node) {
    if(newScopeLevel(node)) {
        scopeQueue.push([]);
        if (node.params){
            var currentScope = scopeQueue[scopeQueue.length - 1];
            for (var i = 0; i < node.params.length; i++) {
                currentScope.push(node.params[i].name);
            }
        }
    }

    if(node.type === 'VariableDeclarator') {
        var currentScope = scopeQueue[scopeQueue.length - 1];
        currentScope.push(node.id.name);
    }
}

function leaveNode(node) {
    if(newScopeLevel(node)){
        node.scope = scopeQueue.slice();
        scopeQueue.pop();
        console.log(node.scope);
    }
}

function testAssumption(ast) {
    estraverse.traverse(ast, {
        enter: function(node){
            console.log(node.type);
        },
        exit: function(node){}
    })
}


if (process.argv.length < 3) {
    console.log('Usage: analyze.js file.js');
    process.exit(1);
}

var filename = process.argv[2];
console.log('Reading ' + filename);
var code = fs.readFileSync(filename, 'utf-8');

var ast = esprima.parse(code, {loc:true});
// initScope(ast);
testAssumption(ast);
console.log('Done');
