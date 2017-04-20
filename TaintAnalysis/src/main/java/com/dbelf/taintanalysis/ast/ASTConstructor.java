package com.dbelf.taintanalysis.ast;

import com.dbelf.taintanalysis.ECMAScriptBaseVisitor;
import com.dbelf.taintanalysis.ECMAScriptParser;
import com.dbelf.taintanalysis.ast.nodes.ASTNode;

/**
 *
 */
public class ASTConstructor extends ECMAScriptBaseVisitor<ASTNode>{

    @Override
    public ASTNode visitProgram(ECMAScriptParser.ProgramContext ctx) {
        return super.visitProgram(ctx);
    }

    @Override
    public ASTNode visitSourceElement(ECMAScriptParser.SourceElementContext ctx) {
        return super.visitSourceElement(ctx);
    }

    @Override
    public ASTNode visitSourceElements(ECMAScriptParser.SourceElementsContext ctx) {
        return super.visitSourceElements(ctx);
    }

    @Override
    public ASTNode visitVariableStatement(ECMAScriptParser.VariableStatementContext ctx) {
        return super.visitVariableStatement(ctx);
    }

    @Override
    public ASTNode visitEmptyStatement(ECMAScriptParser.EmptyStatementContext ctx) {
        return super.visitEmptyStatement(ctx);
    }

    @Override
    public ASTNode visitExpressionStatement(ECMAScriptParser.ExpressionStatementContext ctx) {
        return super.visitExpressionStatement(ctx);
    }

    @Override
    public ASTNode visitIfStatement(ECMAScriptParser.IfStatementContext ctx) {
        return super.visitIfStatement(ctx);
    }
}
