package com.dbelf.taintanalysis.ast.nodes.expressions.unary;

import com.dbelf.taintanalysis.ast.nodes.statements.Statement;

/**
 *
 */
public class BitNotExpression extends UnaryExpression {

    public BitNotExpression(Statement statement, String operation) {
        super(statement, operation);
    }
}
