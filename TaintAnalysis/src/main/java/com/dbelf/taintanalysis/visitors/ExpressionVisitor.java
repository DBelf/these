package com.dbelf.taintanalysis.visitors;

import com.dbelf.taintanalysis.ast.nodes.expressions.Identifier;

/**
 *
 */
public interface ExpressionVisitor<T> {
    T visit(Identifier identifier);
}
