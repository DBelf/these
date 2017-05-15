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
    estraverse = require('estraverse'),
    dfatool = require('dfatool');

var documentSources = ['URL',
    'documentURI',
    'baseURI',
    'cookie',
    'referrer'
];


function traverse(node, func) {
    func(node);
    for (var key in node) {
        if (node.hasOwnProperty(key)) {
            var child = node[key];
            if (typeof child === 'object' && child !== null) {

                if (Array.isArray(child)) {
                    child.forEach(function (node) {
                        traverse(node, func);
                    });
                } else {
                    traverse(child, func);
                }
            }
        }
    }
}


function isSource(node) {
    switch (node.type) {
        case 'VariableDeclarator':
            if (printDeclaration(node)) {
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


function testAssumption(ast) {
    estraverse.traverse(ast, {

        enter: function (node, parent) {
            console.log(node.type);
        },
        exit: function (node) {
        }
    })
}

if (process.argv.length < 3) {
    console.log('Usage: analyze.js file.js');
    process.exit(1);
}

var filename = process.argv[2];
console.log('Reading ' + filename);
var code = fs.readFileSync(filename, 'utf-8');

// Parse AST with esprima, loc must be set true
var ast = esprima.parse(code, {
    loc: true
});

var globalScope = dfatool.newGlobalScope();
dfatool.buildScope(ast, globalScope);

globalScope.initialize();
globalScope.derivation()

var outline = {};

// Iterate all the defined variables and inference its value
for (var name in globalScope._defines) {
    var variable = globalScope._defines[name];
    var value = variable.inference();
    if (value) {
        outline[variable.name] = value.toJSON();
    }
}

console.log(outline);