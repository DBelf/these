package com.dbelf.taintanalysis.ast.visitor;

import com.dbelf.taintanalysis.ECMAScriptBaseVisitor;
import com.dbelf.taintanalysis.ECMAScriptParser;
import com.dbelf.taintanalysis.ast.nodes.ASTNode;
import com.dbelf.taintanalysis.ast.nodes.Program;
import com.dbelf.taintanalysis.ast.nodes.expressions.Expression;
import com.dbelf.taintanalysis.ast.nodes.expressions.ExpressionBlock;
import com.dbelf.taintanalysis.ast.nodes.expressions.binary.*;
import com.dbelf.taintanalysis.ast.nodes.statements.control.IfElseStatement;
import com.dbelf.taintanalysis.ast.nodes.expressions.literals.*;
import com.dbelf.taintanalysis.ast.nodes.expressions.Identifier;
import com.dbelf.taintanalysis.ast.nodes.expressions.unary.*;
import com.dbelf.taintanalysis.ast.nodes.statements.*;
import org.antlr.v4.runtime.tree.TerminalNode;

/**
 *
 */
public class ASTConstructor extends ECMAScriptBaseVisitor<ASTNode>{

    @Override
    public ASTNode visitProgram(ECMAScriptParser.ProgramContext ctx) {
        ECMAScriptParser.SourceElementsContext elements = ctx.sourceElements();
        Statements statements = new Statements();

        for (ECMAScriptParser.SourceElementContext element : elements.sourceElement()){
            System.out.println("Program elements:");
            statements.add((Statement) element.accept(this));
        }

        return new Program(statements);
    }

    @Override
    public ASTNode visitVariableStatement(ECMAScriptParser.VariableStatementContext ctx) {
        ECMAScriptParser.VariableDeclarationListContext variableDeclarationListContext = ctx.variableDeclarationList();
        Statements statements = new Statements();
        //TODO maak wrapper voor declaration lijst.
        for (ECMAScriptParser.VariableDeclarationContext variableDeclarationContext : variableDeclarationListContext.variableDeclaration()){
            Identifier identifier = new Identifier(variableDeclarationContext.Identifier().getText());
            ASTNode expression = variableDeclarationContext.accept(this);
            statements.add(new VariableDeclaration(identifier, expression));
        }
        return statements;
    }

    @Override
    public ASTNode visitFunctionDeclaration(ECMAScriptParser.FunctionDeclarationContext ctx) {

        Identifier identifier = new Identifier(ctx.Identifier().getText());
        ECMAScriptParser.FunctionBodyContext functionBody = ctx.functionBody();
        Statements body = (Statements) functionBody.accept(this);
        ParameterList parameters = (ParameterList) ctx.formalParameterList().accept(this);

        return new FunctionDeclaration(identifier, parameters, body);
    }

    @Override
    public ASTNode visitFunctionBody(ECMAScriptParser.FunctionBodyContext ctx) {
        Statements statements = new Statements();
        ECMAScriptParser.SourceElementsContext elements = ctx.sourceElements();
        for (ECMAScriptParser.SourceElementContext element : elements.sourceElement()) {
            statements.add((Statement) element.accept(this));
        }
        return statements;
    }

    @Override
    public ASTNode visitFormalParameterList(ECMAScriptParser.FormalParameterListContext ctx) {
        ParameterList parameters = new ParameterList();

        for (TerminalNode identifier: ctx.Identifier()) {
            parameters.add(new Identifier(identifier.getText()));
        }

        return parameters;
    }

    @Override
    public ASTNode visitEmptyStatement(ECMAScriptParser.EmptyStatementContext ctx) {
        return super.visitEmptyStatement(ctx);
    }

    @Override
    public ASTNode visitExpressionStatement(ECMAScriptParser.ExpressionStatementContext ctx) {
        return ctx.expressionSequence().accept(this);
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
    public ASTNode visitBlock(ECMAScriptParser.BlockContext ctx) {
        Statements statements = new Statements();
        ECMAScriptParser.StatementListContext statementListContext = ctx.statementList();

        for(ECMAScriptParser.StatementContext statement : statementListContext.statement()) {
            statements.add((Statement) statement.accept(this));
        }

        return statements;
    }

    @Override
    public ASTNode visitMemberDotExpression(ECMAScriptParser.MemberDotExpressionContext ctx) {
        Expression expression = (Expression) ctx.singleExpression().accept(this);
        Identifier identifier = (Identifier) ctx.identifierName().accept(this);
        //TODO What to do with this?
        return new ASTNode() {
        };
    }

    @Override
    public ASTNode visitIfStatement(ECMAScriptParser.IfStatementContext ctx) {
        Statement condition = (Statement) ctx.expressionSequence().accept(this);
        Statements ifStatements = (Statements) ctx.statement().get(0).accept(this);
        Statements elseStatements = null;

        if (ctx.statement().size() > 1) {
            elseStatements = (Statements) ctx.statement().get(0).accept(this);
        }
        return new IfElseStatement(condition, ifStatements, elseStatements);
    }

    @Override
    public ASTNode visitMultiplicativeExpression(ECMAScriptParser.MultiplicativeExpressionContext ctx) {
        Statement lhs = (Statement) ctx.singleExpression().get(0).accept(this);
        Statement rhs = (Statement) ctx.singleExpression().get(1).accept(this);
        String operation = ctx.children.get(1).getText();

        return new MultiplicativeExpression(lhs, rhs, operation);
    }

    @Override
    public ASTNode visitEqualityExpression(ECMAScriptParser.EqualityExpressionContext ctx) {
        Statement lhs = (Statement) ctx.singleExpression().get(0).accept(this);
        Statement rhs = (Statement) ctx.singleExpression().get(1).accept(this);
        String operation = ctx.children.get(1).getText();

        return new EqualityExpression(lhs, rhs, operation);
    }

    @Override
    public ASTNode visitAdditiveExpression(ECMAScriptParser.AdditiveExpressionContext ctx) {
        Statement lhs = (Statement) ctx.singleExpression().get(0).accept(this);
        Statement rhs = (Statement) ctx.singleExpression().get(1).accept(this);
        String operation = ctx.children.get(1).getText();

        return new AdditiveExpression(lhs, rhs, operation);
    }

    @Override
    public ASTNode visitBitShiftExpression(ECMAScriptParser.BitShiftExpressionContext ctx) {
        Statement lhs = (Statement) ctx.singleExpression().get(0).accept(this);
        Statement rhs = (Statement) ctx.singleExpression().get(1).accept(this);
        String operation = ctx.children.get(1).getText();

        return new BitShiftExpression(lhs, rhs, operation);
    }

    @Override
    public ASTNode visitRelationalExpression(ECMAScriptParser.RelationalExpressionContext ctx) {
        Statement lhs = (Statement) ctx.singleExpression().get(0).accept(this);
        Statement rhs = (Statement) ctx.singleExpression().get(1).accept(this);
        String operation = ctx.children.get(1).getText();

        return new RelationalExpression(lhs, rhs, operation);
    }

    @Override
    public ASTNode visitBitAndExpression(ECMAScriptParser.BitAndExpressionContext ctx) {
        Statement lhs = (Statement) ctx.singleExpression().get(0).accept(this);
        Statement rhs = (Statement) ctx.singleExpression().get(1).accept(this);
        String operation = ctx.children.get(1).getText();

        return new BitAndExpression(lhs, rhs, operation);
    }

    @Override
    public ASTNode visitBitXOrExpression(ECMAScriptParser.BitXOrExpressionContext ctx) {
        Statement lhs = (Statement) ctx.singleExpression().get(0).accept(this);
        Statement rhs = (Statement) ctx.singleExpression().get(1).accept(this);
        String operation = ctx.children.get(1).getText();

        return new BitXOrExpression(lhs, rhs, operation);
    }

    @Override
    public ASTNode visitBitOrExpression(ECMAScriptParser.BitOrExpressionContext ctx) {
        Statement lhs = (Statement) ctx.singleExpression().get(0).accept(this);
        Statement rhs = (Statement) ctx.singleExpression().get(1).accept(this);
        String operation = ctx.children.get(1).getText();

        return new BitOrExpression(lhs, rhs, operation);
    }

    @Override
    public ASTNode visitLogicalAndExpression(ECMAScriptParser.LogicalAndExpressionContext ctx) {
        Statement lhs = (Statement) ctx.singleExpression().get(0).accept(this);
        Statement rhs = (Statement) ctx.singleExpression().get(1).accept(this);
        String operation = ctx.children.get(1).getText();

        return new LogicalAndExpression(lhs, rhs, operation);
    }

    @Override
    public ASTNode visitLogicalOrExpression(ECMAScriptParser.LogicalOrExpressionContext ctx) {
        Statement lhs = (Statement) ctx.singleExpression().get(0).accept(this);
        Statement rhs = (Statement) ctx.singleExpression().get(1).accept(this);
        String operation = ctx.children.get(1).getText();

        return new LogicalOrExpression(lhs, rhs, operation);
    }

    @Override
    public ASTNode visitAssignmentOperatorExpression(ECMAScriptParser.AssignmentOperatorExpressionContext ctx) {
        Statement lhs = (Statement) ctx.singleExpression().get(0).accept(this);
        Statement rhs = (Statement) ctx.singleExpression().get(1).accept(this);
        String operation = ctx.assignmentOperator().getText();

        return new AssignmentOperatorExpression(lhs, rhs, operation);
    }

    @Override
    public ASTNode visitFunctionExpression(ECMAScriptParser.FunctionExpressionContext ctx) {//FIXME duplicate code, leave it be?
        Identifier identifier = new Identifier(ctx.Identifier().getText());
        ECMAScriptParser.FunctionBodyContext functionBody = ctx.functionBody();
        Statements body = (Statements) functionBody.accept(this);
        ParameterList parameters = (ParameterList) ctx.formalParameterList().accept(this);

        return new FunctionDeclaration(identifier, parameters, body);
    }

    @Override
    public ASTNode visitBitNotExpression(ECMAScriptParser.BitNotExpressionContext ctx) {
        Statement expression = (Statement) ctx.singleExpression().accept(this);
        String operation = ctx.getChild(0).getText();

        return new BitNotExpression(expression, operation);
    }

    @Override
    public ASTNode visitNotExpression(ECMAScriptParser.NotExpressionContext ctx) {
        Statement expression = (Statement) ctx.singleExpression().accept(this);
        String operation = ctx.getChild(0).getText();

        return new NotExpression(expression, operation);
    }

    @Override
    public ASTNode visitUnaryMinusExpression(ECMAScriptParser.UnaryMinusExpressionContext ctx) {
        Statement expression = (Statement) ctx.singleExpression().accept(this);
        String operation = ctx.getChild(0).getText();

        return new UnaryMinus(expression, operation);
    }

    @Override
    public ASTNode visitUnaryPlusExpression(ECMAScriptParser.UnaryPlusExpressionContext ctx) {
        Statement expression = (Statement) ctx.singleExpression().accept(this);
        String operation = ctx.getChild(0).getText();

        return new UnaryPlusExpression(expression, operation);
    }

    @Override
    public ASTNode visitPreIncrementExpression(ECMAScriptParser.PreIncrementExpressionContext ctx) {
        Statement expression = (Statement) ctx.singleExpression().accept(this);
        String operation = ctx.getChild(0).getText();

        return new PreIncrementExpression(expression, operation);
    }

    @Override
    public ASTNode visitPreDecreaseExpression(ECMAScriptParser.PreDecreaseExpressionContext ctx) {
        Statement expression = (Statement) ctx.singleExpression().accept(this);
        String operation = ctx.getChild(0).getText();

        return new PreDecrementExpression(expression, operation);
    }

    @Override
    public ASTNode visitPostDecreaseExpression(ECMAScriptParser.PostDecreaseExpressionContext ctx) {
        Statement expression = (Statement) ctx.singleExpression().accept(this);
        String operation = ctx.getChild(1).getText();

        return new PostDecrementExpression(expression, operation);
    }

    @Override
    public ASTNode visitPostIncrementExpression(ECMAScriptParser.PostIncrementExpressionContext ctx) {
        Statement expression = (Statement) ctx.singleExpression().accept(this);
        String operation = ctx.getChild(1).getText();

        return new PostIncrementExpression(expression, operation);
    }

    @Override
    public ASTNode visitParenthesizedExpression(ECMAScriptParser.ParenthesizedExpressionContext ctx) {
        return ctx.expressionSequence().accept(this);
    }

    @Override
    public ASTNode visitLiteral(ECMAScriptParser.LiteralContext ctx) {
        if (ctx.BooleanLiteral() != null) {
            return new BooleanLiteral(convertTextToBoolean(ctx.getText()));
        } else if (ctx.StringLiteral() != null) {
            return new StringLiteral(ctx.StringLiteral().getText());
        } else if (ctx.RegularExpressionLiteral() != null) {
            //TODO Decide whether I will implement this.
        } else if (ctx.numericLiteral() != null) {
            return ctx.numericLiteral().accept(this);
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