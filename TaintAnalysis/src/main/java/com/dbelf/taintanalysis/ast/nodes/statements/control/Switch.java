package com.dbelf.taintanalysis.ast.nodes.statements.control;

import com.dbelf.taintanalysis.ast.nodes.statements.Statement;
import com.dbelf.taintanalysis.visitors.StatementVisitor;

import java.util.Map;

/**
 *
 */
public class Switch implements Statement {

    private Statement expression;
    private SwitchClauses clauses;

    public Switch (Statement expression, SwitchClauses clauses) {
        this.expression = expression;
        this.clauses = clauses;
    }

    public <T> T accept(StatementVisitor<T> visitor) {
        return visitor.visit(this);
    }
}
