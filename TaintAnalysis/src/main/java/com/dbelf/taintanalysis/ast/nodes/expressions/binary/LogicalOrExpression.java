package com.dbelf.taintanalysis.ast.nodes.expressions.binary;

import com.dbelf.taintanalysis.ast.nodes.statements.Statement;

/**
 *
 */
public class LogicalOrExpression extends BinaryExpression {

    public LogicalOrExpression(Statement lhs, Statement rhs, String operation) {
        super(lhs, rhs, operation);
    }
}
