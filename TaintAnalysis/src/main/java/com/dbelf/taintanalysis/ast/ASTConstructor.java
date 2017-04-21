package com.dbelf.taintanalysis.ast;

import com.dbelf.taintanalysis.ECMAScriptBaseVisitor;
import com.dbelf.taintanalysis.ECMAScriptParser;
import com.dbelf.taintanalysis.ast.nodes.ASTNode;
import com.dbelf.taintanalysis.ast.nodes.literals.HexIntegerLiteral;
import com.dbelf.taintanalysis.ast.nodes.literals.NumberLiteral;
import com.dbelf.taintanalysis.ast.nodes.literals.OctalIntegerLiteral;

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
        ECMAScriptParser.VariableDeclarationListContext variableDeclarationListContext = ctx.variableDeclarationList();
        for (ECMAScriptParser.VariableDeclarationContext variableDeclarationContext : variableDeclarationListContext.variableDeclaration()){
            variableDeclarationContext.accept(this);
        }
        return new ASTNode() {
        };
    }
//167A43
    //408C8E
    @Override
    public ASTNode visitFunctionDeclaration(ECMAScriptParser.FunctionDeclarationContext ctx) {
        System.out.println(ctx.Identifier().getText());
        ECMAScriptParser.FunctionBodyContext body = ctx.functionBody();
        body.accept(this);
        return new ASTNode() {//TODO make clear
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

    @Override
    public ASTNode visitLiteral(ECMAScriptParser.LiteralContext ctx) {
        return super.visitLiteral(ctx);
    }

    @Override
    public ASTNode visitDecimalLiteral(ECMAScriptParser.DecimalLiteralContext ctx) {
        System.out.println(ctx.getText());
        return new NumberLiteral(convertTextToDecimal(ctx.getText()));
    }

    @Override
    public ASTNode visitHexIntegerLiteral(ECMAScriptParser.HexIntegerLiteralContext ctx) {
        return new HexIntegerLiteral(convertTextToHex(ctx.getText()));
    }

    @Override
    public ASTNode visitOctalIntegerLiteral(ECMAScriptParser.OctalIntegerLiteralContext ctx) {
        return new OctalIntegerLiteral(convertTextToOct(ctx.getText()));
    }

    private double convertTextToDecimal(String text){
        return Double.parseDouble(text);
    }

    private int convertTextToHex(String text) {return Integer.parseInt(text, 16);}

    private int convertTextToOct(String text) {return Integer.parseInt(text, 8);}

}

//Alle singleexpressions moeten.