package com.dbelf.taintanalysis.ast.nodes.literals;

import com.dbelf.taintanalysis.visitors.LiteralVisitor;

/**
 *
 */
public class DecimalLiteral implements NumericLiteral{


    public <T> T accept(LiteralVisitor<T> visitor) {
        return visitor.visit(this);
    }
}
