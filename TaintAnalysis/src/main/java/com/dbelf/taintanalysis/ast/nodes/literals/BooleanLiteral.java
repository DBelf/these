package com.dbelf.taintanalysis.ast.nodes.literals;

import com.dbelf.taintanalysis.visitors.LiteralVisitor;

/**
 *
 */
public class BooleanLiteral implements Literal {
    boolean value;

    public BooleanLiteral(boolean value) {
        this.value = value;
    }

    public <T> T accept(LiteralVisitor<T> visitor) { return visitor.visit(this); }
}
