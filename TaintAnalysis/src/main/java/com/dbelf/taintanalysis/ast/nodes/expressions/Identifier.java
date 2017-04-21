package com.dbelf.taintanalysis.ast.nodes.expressions;

import com.dbelf.taintanalysis.visitors.ExpressionVisitor;

/**
 *
 */
public class Identifier implements Expression {
    private String name;

    public Identifier(String name) {
        this.name = name;
    }

    public <T> T accept(ExpressionVisitor<T> visitor) {
        return visitor.visit(this);
    }
}
