package com.dbelf.taintanalysis.ast.nodes.statements;

import com.dbelf.taintanalysis.ast.nodes.ASTNode;
import com.dbelf.taintanalysis.visitors.StatementVisitor;

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

    public List<Statement> getStatements() {
        return statements;
    }

    public <T> T accept(StatementVisitor<T> visitor) {
        return visitor.visit(this);
    }
}
