package com.dbelf.taintanalysis.ast.nodes.expressions.literals;

import com.dbelf.taintanalysis.visitors.LiteralVisitor;

/**
 *
 */
public class OctalIntegerLiteral implements NumericLiteral{
    private int value;

    public OctalIntegerLiteral(int value){
        this.value = value;
    }

    public <T> T accept(LiteralVisitor<T> visitor) {
        return visitor.visit(this);
    }
}
