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
const GenerateAST = require('./GenerateAST');
const Scope = require('./Scope');


const analyze = function (path) {
  console.log(path);
  const ast = GenerateAST.astFromFile(path);
  const globalScope = Scope.getGlobalScope(ast);
  const sources = Scope.nestedVariableSources(path, globalScope);
  sources.map(source => console.log(source));
};

if (process.argv.length < 3) {
  console.log('Usage: ASTTaint.js file.js');
  process.exit(1);
}

const projectPath = process.argv[2];
console.log(`Reading ${projectPath}`);

const filesInProject = GenerateAST.collectFiles(projectPath);
filesInProject.map(file => analyze(file));

// Parse AST with esprima, loc must be set true
// const ast = GenerateAST.astFromFile(filename);
//
// const globalScope = Scope.getGlobalScope(ast);
// const sourcesInFile = Scope.nestedVariableSources(globalScope);
//
// console.log(sourcesInFile);

