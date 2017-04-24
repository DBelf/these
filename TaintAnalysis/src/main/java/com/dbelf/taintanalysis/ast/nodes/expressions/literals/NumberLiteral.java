package com.dbelf.taintanalysis.ast.nodes.expressions.literals;

import com.dbelf.taintanalysis.visitors.LiteralVisitor;

/**
 *
 */
public class NumberLiteral implements NumericLiteral{
    //JavaScript supports Numbers which don't neccesarily have commas
    private double value;

    public NumberLiteral(double value) {
        this.value = value;
    }

    public <T> T accept(LiteralVisitor<T> visitor) {
        return visitor.visit(this);
    }
}
