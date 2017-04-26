package com.dbelf.taintanalysis.ast.nodes.statements.control;

import com.dbelf.taintanalysis.ast.nodes.statements.Statement;
import com.dbelf.taintanalysis.visitors.StatementVisitor;

/**
 *
 */
public class Switch implements Statement {
    public <T> T accept(StatementVisitor<T> visitor) {
        return visitor.visit(this);
    }
}
