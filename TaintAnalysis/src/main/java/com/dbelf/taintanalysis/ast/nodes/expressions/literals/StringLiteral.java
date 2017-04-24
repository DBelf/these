package com.dbelf.taintanalysis.ast.nodes.expressions.literals;

import com.dbelf.taintanalysis.visitors.LiteralVisitor;

/**
 *
 */
public class StringLiteral implements Literal{
    String value;

    public StringLiteral(String value) {
        this.value = value;
    }

    public <T> T accept(LiteralVisitor<T> visitor) { return visitor.visit(this); }
}
