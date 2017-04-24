package com.dbelf.taintanalysis.ast.nodes.expressions.control;

import com.dbelf.taintanalysis.ast.nodes.expressions.Expression;
import com.dbelf.taintanalysis.ast.nodes.statements.Statement;
import com.dbelf.taintanalysis.ast.nodes.statements.Statements;
import com.dbelf.taintanalysis.visitors.ExpressionVisitor;


/**
 *
 */
public class IfElseStatement implements Expression {

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

    public <T> T accpet (ExpressionVisitor<T> visitor) {
        return visitor.visit(this);
    }
}
