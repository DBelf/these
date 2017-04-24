package com.dbelf.taintanalysis.ast.nodes.expressions.unary;

import com.dbelf.taintanalysis.ast.nodes.statements.Statement;

/**
 *
 */
public class UnaryPlusExpression extends UnaryExpression {

    public UnaryPlusExpression(Statement statement, String operation) {
        super(statement, operation);
    }
}
