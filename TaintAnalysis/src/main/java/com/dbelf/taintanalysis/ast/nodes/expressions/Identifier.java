package com.dbelf.taintanalysis.ast.nodes.expressions;

import com.dbelf.taintanalysis.visitors.StatementVisitor;

/**
 *
 */
public class Identifier implements Expression {
    private String name;

    public Identifier(String name) {
        this.name = name;
    }

    @Override
    public String toString() {
        return name;
    }

    public <T> T accept(StatementVisitor<T> visitor) {
        return visitor.visit(this);
    }
}
