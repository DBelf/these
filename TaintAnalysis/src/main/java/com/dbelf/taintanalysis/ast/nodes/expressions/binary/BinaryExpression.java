package com.dbelf.taintanalysis.ast.nodes.expressions.binary;

import com.dbelf.taintanalysis.ast.nodes.expressions.Expression;
import com.dbelf.taintanalysis.ast.nodes.statements.Statement;

/**
 *
 */
public abstract class BinaryExpression implements Expression {
    private Statement lhs;
    private Statement rhs;
    private String operation;

    public BinaryExpression(Statement lhs, Statement rhs, String operation) {
        this.lhs = lhs;
        this.rhs = rhs;
        this.operation = operation;
    }

    public Statement getLhs() {
        return lhs;
    }

    public Statement getRhs() {
        return rhs;
    }

    public String getOparation() {
        return operation;
    }
}
