package com.dbelf.taintanalysis.visitors;

import com.dbelf.taintanalysis.ast.nodes.expressions.Identifier;
import com.dbelf.taintanalysis.ast.nodes.expressions.binary.EqualityExpression;
import com.dbelf.taintanalysis.ast.nodes.expressions.binary.MultiplicativeExpression;
import com.dbelf.taintanalysis.ast.nodes.expressions.control.IfElseStatement;

/**
 *
 */
public interface ExpressionVisitor<T> {
    T visit(Identifier identifier);

    T visit(IfElseStatement ifElseStatement);

    T visit(MultiplicativeExpression multiplicativeExpression);

    T visit(EqualityExpression equalityExpression);
}
