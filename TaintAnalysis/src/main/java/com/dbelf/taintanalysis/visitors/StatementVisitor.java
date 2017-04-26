package com.dbelf.taintanalysis.visitors;

import com.dbelf.taintanalysis.ast.nodes.expressions.Identifier;
import com.dbelf.taintanalysis.ast.nodes.expressions.binary.*;
import com.dbelf.taintanalysis.ast.nodes.expressions.literals.*;
import com.dbelf.taintanalysis.ast.nodes.expressions.unary.*;
import com.dbelf.taintanalysis.ast.nodes.statements.FunctionDeclaration;
import com.dbelf.taintanalysis.ast.nodes.statements.Statements;
import com.dbelf.taintanalysis.ast.nodes.statements.control.ForStatement;
import com.dbelf.taintanalysis.ast.nodes.statements.control.IfElseStatement;
import com.dbelf.taintanalysis.ast.nodes.statements.control.Switch;
import com.dbelf.taintanalysis.ast.nodes.statements.VariableDeclaration;

/**
 *
 */
public interface StatementVisitor<T> {

    T visit(VariableDeclaration variableDeclaration);

    T visit(Switch switchstatement);

    T visit(FunctionDeclaration functionDeclaration);

    T visit(Statements statements);

    T visit(IfElseStatement ifElseStatement);

    T visit(Identifier identifier);

    T visit(MultiplicativeExpression multiplicativeExpression);

    T visit(EqualityExpression equalityExpression);

    T visit(AdditiveExpression additiveExpression);

    T visit(AssignmentOperatorExpression assignmentOperatorExpression);

    T visit(BitAndExpression bitAndExpression);

    T visit(BitOrExpression bitOrExpression);

    T visit(BitShiftExpression bitShiftExpression);

    T visit(BitXOrExpression bitXOrExpression);

    T visit(LogicalAndExpression logicalAndExpression);

    T visit(LogicalOrExpression logicalOrExpression);

    T visit(RelationalExpression relationalExpression);

    T visit(BitNotExpression bitNotExpression);

    T visit(NotExpression notExpression);

    T visit(PostDecrementExpression postDecrementExpression);

    T visit(PostIncrementExpression postIncrementExpression);

    T visit(PreDecrementExpression preDecrementExpression);

    T visit(UnaryMinus unaryMinus);

    T visit(UnaryPlusExpression unaryPlusExpression);

    T visit(PreIncrementExpression preIncrementExpression);

    T visit(NumberLiteral numberLiteral);

    T visit(HexIntegerLiteral hexIntegerLiteral);

    T visit(OctalIntegerLiteral octalIntegerLiteral);

    T visit(StringLiteral stringLiteral);

    T visit(BooleanLiteral booleanLiteral);

    T visit(NullLiteral nullLiteral);

    T visit(ForStatement forStatement);
}
