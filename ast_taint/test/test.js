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
      const path = './test/test.js';
      const ast = GenerateAST.astFromFile(path);
      expect(ast).to.not.be.undefined;
    });
  });
});

describe('Scope Analysis', () => {
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
    it('can find the source in the implicit return of an arrow function', () => {
      const path = 'test/ast_tests/source/arrow_source.js';
      const ast = GenerateAST.astFromFile(path);
      const globalScope = ScopeAnalysis.getGlobalScope(ast);
      const sources = ScopeAnalysis.nestedVariableSources(path, globalScope);
      expect(sources).to.have.lengthOf(1);
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
      expect(sinks).to.have.lengthOf(1);
    });
    it('can detect sinks in nested scopes', () => {
      const path = 'test/ast_tests/sink/nested_sinks.js';
      const ast = GenerateAST.astFromFile(path);
      const globalScope = ScopeAnalysis.getGlobalScope(ast);
      const sinks = ScopeAnalysis.nestedSinks(path, globalScope);
      expect(sinks).to.have.lengthOf(1);
    });
    it('can detect a sink within an anonymous function', () => {
      const path = 'test/ast_tests/sink/arrow_sink.js';
      const ast = GenerateAST.astFromFile(path);
      const globalScope = ScopeAnalysis.getGlobalScope(ast);
      const sinks = ScopeAnalysis.nestedSinks(path, globalScope);
      expect(sinks).to.have.lengthOf(1);
    });
  });
});

