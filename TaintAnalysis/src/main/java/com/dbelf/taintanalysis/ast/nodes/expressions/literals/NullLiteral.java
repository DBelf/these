package com.dbelf.taintanalysis.ast.nodes.expressions.literals;

import com.dbelf.taintanalysis.visitors.StatementVisitor;

/**
 *
 */
public class NullLiteral implements Literal {

    public NullLiteral(){

    }

    public <T> T accept(StatementVisitor<T> visitor) {
        return visitor.visit(this);
    }
}
