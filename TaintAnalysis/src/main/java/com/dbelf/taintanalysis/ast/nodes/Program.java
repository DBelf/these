package com.dbelf.taintanalysis.ast.nodes;

import com.dbelf.taintanalysis.ast.nodes.statements.Statements;
import com.dbelf.taintanalysis.visitors.ProgramVisitor;

/**
 *
 */
public class Program implements ASTNode{
    private Statements statements;

    public Program(Statements statements) {
        this.statements = statements;
    }

    public <T> T accept(ProgramVisitor<T> visitor) {
        return visitor.visit(this);
    }

    public Statements getStatements() {
        return statements;
    }
}
