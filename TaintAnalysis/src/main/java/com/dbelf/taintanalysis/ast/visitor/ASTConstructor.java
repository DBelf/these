package com.dbelf.taintanalysis.ast.visitor;

import com.dbelf.taintanalysis.ECMAScriptBaseVisitor;
import com.dbelf.taintanalysis.ECMAScriptParser;
import com.dbelf.taintanalysis.ast.nodes.ASTNode;
import com.dbelf.taintanalysis.ast.nodes.expressions.Expression;
import com.dbelf.taintanalysis.ast.nodes.expressions.ExpressionBlock;
import com.dbelf.taintanalysis.ast.nodes.literals.*;
import com.dbelf.taintanalysis.ast.nodes.expressions.Identifier;
import com.dbelf.taintanalysis.ast.nodes.statements.VariableDeclaration;

import java.util.ArrayList;
import java.util.List;

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
        //TODO maak wrapper voor declaration lijst.
        for (ECMAScriptParser.VariableDeclarationContext variableDeclarationContext : variableDeclarationListContext.variableDeclaration()){
            Identifier identifier = new Identifier(variableDeclarationContext.Identifier().getText());
            ASTNode expression = variableDeclarationContext.accept(this);
            VariableDeclaration declaration = new VariableDeclaration(identifier, expression);
        }
        return new ASTNode() {
        };
    }

    @Override
    public ASTNode visitFunctionDeclaration(ECMAScriptParser.FunctionDeclarationContext ctx) {
        Identifier identifier = new Identifier(ctx.Identifier().getText());

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
        ExpressionBlock expressions = new ExpressionBlock();

        for (ECMAScriptParser.SingleExpressionContext expression : ctx.singleExpression()){
            expressions.add((Expression) expression.accept(this));
        }

        return expressions;
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
        if (ctx.BooleanLiteral() != null) {
            return new BooleanLiteral(convertTextToBoolean(ctx.getText()));
        } else if (ctx.StringLiteral() != null) {
            return new StringLiteral(ctx.StringLiteral().getText());
        } else if (ctx.RegularExpressionLiteral() != null) {
            //TODO Decide whether I will implement this.
        }
        return new NullLiteral();
    }

    @Override
    public ASTNode visitDecimalLiteral(ECMAScriptParser.DecimalLiteralContext ctx) {
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

    @Override
    public ASTNode visitIdentifierExpression(ECMAScriptParser.IdentifierExpressionContext ctx) {
        return new Identifier(ctx.getText());
    }

    @Override
    public ASTNode visitIdentifierName(ECMAScriptParser.IdentifierNameContext ctx) {
        return new Identifier(ctx.getText());
    }

    private double convertTextToDecimal(String text){
        return Double.parseDouble(text);
    }

    private int convertTextToHex(String text) {return Integer.parseInt(text, 16);}

    private int convertTextToOct(String text) {return Integer.parseInt(text, 8);}

    private boolean convertTextToBoolean(String text) {return Boolean.parseBoolean(text);}

}

//Alle singleexpressions moeten.