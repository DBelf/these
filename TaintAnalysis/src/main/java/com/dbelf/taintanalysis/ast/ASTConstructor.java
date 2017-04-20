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
        ECMAScriptParser.SourceElementsContext elements = ctx.sourceElements();

        for (ECMAScriptParser.SourceElementContext element : elements.sourceElement()){
            System.out.println("Program elements:");
            element.accept(this);
        }
        return new ASTNode() {
        };
    }

    @Override
    public ASTNode visitStatement(ECMAScriptParser.StatementContext ctx) {
        return super.visitStatement(ctx);
    }

    @Override
    public ASTNode visitVariableStatement(ECMAScriptParser.VariableStatementContext ctx) {

        return new ASTNode() {
        };
    }

    @Override
    public ASTNode visitFunctionDeclaration(ECMAScriptParser.FunctionDeclarationContext ctx) {
        System.out.println(ctx.Identifier().getText());
        ECMAScriptParser.FunctionBodyContext body = ctx.functionBody();
        body.accept(this);
        return new ASTNode() {
        };
    }

    @Override
    public ASTNode visitEmptyStatement(ECMAScriptParser.EmptyStatementContext ctx) {
        return super.visitEmptyStatement(ctx);
    }

    @Override
    public ASTNode visitExpressionStatement(ECMAScriptParser.ExpressionStatementContext ctx) {
        ctx.expressionSequence().accept(this);
        return new ASTNode() {
        };
    }

    @Override
    public ASTNode visitExpressionSequence(ECMAScriptParser.ExpressionSequenceContext ctx) {
        for (ECMAScriptParser.SingleExpressionContext expression : ctx.singleExpression()){
            expression.accept(this);
        }
        return new ASTNode() {
        };
    }

    @Override
    public ASTNode visitMemberDotExpression(ECMAScriptParser.MemberDotExpressionContext ctx) {
        System.out.println(ctx.getText());
        return new ASTNode() {
        };
    }

    @Override
    public ASTNode visitIfStatement(ECMAScriptParser.IfStatementContext ctx) {
        return super.visitIfStatement(ctx);
    }


}

//Alle singleexpressions moeten.