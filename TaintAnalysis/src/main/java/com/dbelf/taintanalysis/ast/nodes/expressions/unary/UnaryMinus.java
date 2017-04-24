package com.dbelf.taintanalysis.ast.nodes.expressions.unary;

import com.dbelf.taintanalysis.ast.nodes.statements.Statement;

/**
 *
 */
public class UnaryMinus extends UnaryExpression {

    public UnaryMinus(Statement statement, String operation) {
        super(statement, operation);
    }
}
