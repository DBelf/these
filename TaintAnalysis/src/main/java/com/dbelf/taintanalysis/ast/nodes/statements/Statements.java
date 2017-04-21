package com.dbelf.taintanalysis.ast.nodes.statements;

import java.util.List;

/**
 *
 */
public class Statements implements Statement{
    private List<Statement> statements;

    public Statements(List<Statement> statements) {
        this.statements = statements;
    }

    public void add(Statement statement){
        statements.add(statement);
    }
}
