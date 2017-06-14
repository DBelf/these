/* eslint-disable no-undef,no-unused-expressions */
/**
 * Created by dimitri on 11/05/2017.
 */
const chai = require('chai');
// const SourceFinder = require('../lib/SourceFinder');
// const SinkFinder = require('../lib/SinkFinder');
// const Utils = require('../lib/Utils');
const GenerateAST = require('../lib/GenerateAST');
const ScopeAnalysis = require('../lib/Scope');

const expect = chai.expect; // we are using the "expect" style of Chai

describe('AST generation', () => {
  describe('Collecting all javascript files', () => {
    it('can\'t find non-existing paths', () => {
      const falsePath = '';
      const value = GenerateAST.collectFiles(falsePath);
      expect(value).to.be.empty;
    });
    it('finds all files with the javascript extension', () => {
      const path = '../';
      const value = GenerateAST.collectFiles(path);
      expect(value.length).to.be.at.least(5);
    });
    it('prints the source lines of the statement', () => {
      const path = './test/test_resources/line_print.js';
      const ast = GenerateAST.astFromFile(path);
      const sourceCode = GenerateAST.returnLines(path, ast.body[0].loc);
      expect(sourceCode).to.have.lengthOf(1);
    });
  });
  describe('Creates an AST', () => {
    it('creates an AST from one file', () => {
      const path = './test/test.js';
      const ast = GenerateAST.astFromFile(path);
      expect(ast).to.not.be.undefined;
    });
    it('can make the scope and hoist statements from within a for loop', () => {
      const path = './test/ast_tests/source/for_loop.js';
      const ast = GenerateAST.astFromFile(path);
      const scope = ScopeAnalysis.getGlobalScope(ast);
      const globalStatements = (scope.block.body).reduce((acc, statement) => acc.concat(
        ScopeAnalysis.hoistFromControl(statement)), []);
      expect(globalStatements).to.have.lengthOf(4);
    });
  });
});

describe('Scope Analysis', () => {
  describe('Scope Generating', () => {
    it('detects the blockscope of a for-loop', () => {
      const path = './test/ast_tests/source/for_loop.js';
      const ast = GenerateAST.astFromFile(path);
      const globalScope = ScopeAnalysis.getGlobalScope(ast);
      expect(globalScope.childScopes).to.have.lengthOf(2);// FIXME for loop hoisting?
    });
  });
  describe('Source Detection', () => {
    it('can find a source within the global scope', () => {
      const path = 'test/ast_tests/source/value_access.js';
      const ast = GenerateAST.astFromFile(path);
      const globalScope = ScopeAnalysis.getGlobalScope(ast);
      const sources = ScopeAnalysis.nestedVariableSources(path, globalScope);
      expect(sources).to.have.lengthOf(1);
    });
    it('can find a function returning a source', () => {
      const path = 'test/ast_tests/source/function_returns_source.js';
      const ast = GenerateAST.astFromFile(path);
      const globalScope = ScopeAnalysis.getGlobalScope(ast);
      const sources = ScopeAnalysis.nestedVariableSources(path, globalScope);
      expect(sources.filter(source => source.type === 'FunctionDeclaration')).to.have.lengthOf(1);
    });
    it('can find a source and its aliases in the global scope', () => {
      const path = 'test/ast_tests/source/source_reassign.js';
      const ast = GenerateAST.astFromFile(path);
      const globalScope = ScopeAnalysis.getGlobalScope(ast);
      const sources = ScopeAnalysis.nestedVariableSources(path, globalScope);
      expect(sources).to.have.lengthOf(3);
    });
    it('can find nested sources', () => {
      path = 'test/ast_tests/source/scoped_sources_with_function_return.js';
      const ast = GenerateAST.astFromFile(path);
      const globalScope = ScopeAnalysis.getGlobalScope(ast);
      const sources = ScopeAnalysis.nestedVariableSources(path, globalScope);
      expect(sources).to.have.lengthOf(5);// TODO check the function aswell?
    });
    it('can find functions returning aliased global sources', () => {
      const path = 'test/ast_tests/source/scoped_sources_with_function_return.js';
      const ast = GenerateAST.astFromFile(path);
      const globalScope = ScopeAnalysis.getGlobalScope(ast);
      const sources = ScopeAnalysis.nestedVariableSources(path, globalScope);
      expect(sources.filter(source => source.type === 'FunctionDeclaration')).to.have.lengthOf(1);
    });
    it('can find the source in a for loop', () => {
      const path = 'test/ast_tests/source/for_loop.js';
      const ast = GenerateAST.astFromFile(path);
      const globalScope = ScopeAnalysis.getGlobalScope(ast);
      const sources = ScopeAnalysis.nestedVariableSources(path, globalScope);
      expect(sources).to.have.lengthOf(0);// FIXME for loop hoisting?
    });
    it('can find the source in the implicit return of an arrow function', () => {
      const path = 'test/ast_tests/source/arrow_source.js';
      const ast = GenerateAST.astFromFile(path);
      const globalScope = ScopeAnalysis.getGlobalScope(ast);
      const sources = ScopeAnalysis.nestedVariableSources(path, globalScope);
      expect(sources).to.have.lengthOf(1);
    });
    it('can detect a source in a listener function', () => {
      const path = 'test/ast_tests/source/declared_listener_function.js';
      const ast = GenerateAST.astFromFile(path);
      const globalScope = ScopeAnalysis.getGlobalScope(ast);
      const sources = ScopeAnalysis.nestedVariableSources(path, globalScope);
      console.log(sources);
      expect(sources).to.have.lengthOf(2);
    });
    it('can find the source within either clause of an if statement', () => {
      const path = 'test/ast_tests/source/if_source.js';
      const ast = GenerateAST.astFromFile(path);
      const globalScope = ScopeAnalysis.getGlobalScope(ast);
      const sources = ScopeAnalysis.nestedVariableSources(path, globalScope);
      expect(sources).to.have.lengthOf(2);
    });
  });
  describe('Sink Detection', () => {
    it('can detect eval calls without checking the arguments', () => {
      const path = 'test/ast_tests/sink/sink_call.js';
      const ast = GenerateAST.astFromFile(path);
      const globalScope = ScopeAnalysis.getGlobalScope(ast);
      const sinks = ScopeAnalysis.nestedSinks(path, globalScope);
      expect(sinks).to.have.lengthOf(3);
    });
    it('can detect document sinks', () => {
      const path = 'test/ast_tests/sink/document_sink.js';
      const ast = GenerateAST.astFromFile(path);
      const globalScope = ScopeAnalysis.getGlobalScope(ast);
      const sinks = ScopeAnalysis.nestedSinks(path, globalScope);
      expect(sinks).to.have.lengthOf(2);
    });
    it('can detect sinks in nested scopes', () => {
      const path = 'test/ast_tests/sink/nested_sinks.js';
      const ast = GenerateAST.astFromFile(path);
      const globalScope = ScopeAnalysis.getGlobalScope(ast);
      const sinks = ScopeAnalysis.nestedSinks(path, globalScope);
      expect(sinks).to.have.lengthOf(1);
    });
    it('can detect a communication sink.', () => {
      const path = 'test/ast_tests/sink/send_message.js';
      const ast = GenerateAST.astFromFile(path);
      const globalScope = ScopeAnalysis.getGlobalScope(ast);
      const sinks = ScopeAnalysis.nestedSinks(path, globalScope);
      console.log(sinks);
      expect(sinks).to.have.lengthOf(3);
    });
    it('can detect a sink within an anonymous function', () => {
      const path = 'test/ast_tests/sink/arrow_sink.js';
      const ast = GenerateAST.astFromFile(path);
      const globalScope = ScopeAnalysis.getGlobalScope(ast);
      const sinks = ScopeAnalysis.nestedSinks(path, globalScope);
      expect(sinks).to.have.lengthOf(1);// FIXME fails because statements have to be hoisted..
    });
  });
  describe('Sources and Sinks', () => {
    it('can find all non-aliased sources and sinks', () => {
      const path = 'test/ast_tests/sources_and_sinks/declarations.js';
      const ast = GenerateAST.astFromFile(path);
      const globalScope = ScopeAnalysis.getGlobalScope(ast);
      const sinks = ScopeAnalysis.nestedSinks(path, globalScope);
      expect(sinks).to.have.lengthOf(1);// FIXME fails because statements have to be hoisted..
    });
  });
});

