package com.dbelf.taintanalysis.ast.nodes.statements.control;

import com.dbelf.taintanalysis.ast.nodes.statements.Statement;
import com.dbelf.taintanalysis.ast.nodes.statements.Statements;
import com.dbelf.taintanalysis.visitors.StatementVisitor;


/**
 *
 */
public class IfElseStatement implements Statement {

    private Statement condition;
    private Statements ifStatements;
    private Statements elseStatements;

    public IfElseStatement(Statement condition, Statements ifStatements, Statements elseStatements) {
        this.condition = condition;
        this.ifStatements = ifStatements;
        this.elseStatements = elseStatements;
    }

    public boolean hasElse(){
        return (this.elseStatements != null);
    }

    public <T> T accept (StatementVisitor<T> visitor) {
        return visitor.visit(this);
    }

    public Statement condition() {
        return condition;
    }

    public Statements ifStatements() {
        return ifStatements;
    }

    public Statements elseStatements() {
        return elseStatements;
    }
}
