package com.dbelf.taintanalysis.ast.nodes.expressions.literals;

import com.dbelf.taintanalysis.visitors.StatementVisitor;

/**
 *
 */
public class BooleanLiteral implements Literal {
    boolean value;

    public BooleanLiteral(boolean value) {
        this.value = value;
    }

    public <T> T accept(StatementVisitor<T> visitor) { return visitor.visit(this); }

    @Override
    public String toString() {
        return Boolean.toString(value);
    }
}
