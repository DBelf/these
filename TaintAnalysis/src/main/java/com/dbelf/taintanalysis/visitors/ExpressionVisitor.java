package com.dbelf.taintanalysis.visitors;

import com.dbelf.taintanalysis.ast.nodes.expressions.Identifier;
import com.dbelf.taintanalysis.ast.nodes.expressions.control.IfElseStatement;

/**
 *
 */
public interface ExpressionVisitor<T> {
    T visit(Identifier identifier);

    T visit(IfElseStatement ifElseStatement);
}
