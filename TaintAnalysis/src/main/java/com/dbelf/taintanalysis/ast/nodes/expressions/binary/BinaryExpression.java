package com.dbelf.taintanalysis.ast.nodes.expressions.binary;

import com.dbelf.taintanalysis.ast.nodes.expressions.Expression;
import com.dbelf.taintanalysis.ast.nodes.statements.Statement;

/**
 *
 */
public abstract class BinaryExpression implements Expression {
    Statement lhs;
    Statement rhs;
    String operation;

    public BinaryExpression(Statement lhs, Statement rhs, String operation) {
        this.lhs = lhs;
        this.rhs = rhs;
        this.operation = operation;
    }
}
