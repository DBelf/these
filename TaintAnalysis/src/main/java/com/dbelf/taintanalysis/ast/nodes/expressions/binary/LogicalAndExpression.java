package com.dbelf.taintanalysis.ast.nodes.expressions.binary;

import com.dbelf.taintanalysis.ast.nodes.statements.Statement;

/**
 *
 */
public class LogicalAndExpression extends BinaryExpression {

    public LogicalAndExpression(Statement lhs, Statement rhs, String operation) {
        super(lhs, rhs, operation);
    }
}
