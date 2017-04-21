package com.dbelf.taintanalysis.ast.nodes.literals;

import com.dbelf.taintanalysis.visitors.LiteralVisitor;

/**
 *
 */
public class HexIntegerLiteral implements NumericLiteral{

    private int value;

    public HexIntegerLiteral(int value){
        this.value = value;
    }

    public <T> T accept(LiteralVisitor<T> visitor) {
        return visitor.visit(this);
    }
}
