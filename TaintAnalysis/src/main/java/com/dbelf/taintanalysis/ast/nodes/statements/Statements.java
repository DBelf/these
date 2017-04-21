package com.dbelf.taintanalysis.ast.nodes.statements;

import java.util.ArrayList;
import java.util.List;

/**
 *
 */
public class Statements implements Statement{
    private List<Statement> statements;

    public Statements() {
        this.statements = new ArrayList<Statement>();
    }

    public void add(Statement statement){
        statements.add(statement);
    }
}
