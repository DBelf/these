package com.dbelf.taintanalysis.ast.nodes.expressions.literals;

import com.dbelf.taintanalysis.visitors.StatementVisitor;

/**
 *
 */
public class OctalIntegerLiteral implements NumericLiteral{
    private int value;

    public OctalIntegerLiteral(int value){
        this.value = value;
    }

    public <T> T accept(StatementVisitor<T> visitor) {
        return visitor.visit(this);
    }

    @Override
    public String toString() {
        return Integer.toString(value);
    }
}
