package com.dbelf.taintanalysis.ast.nodes.expressions.unary;

import com.dbelf.taintanalysis.ast.nodes.statements.Statement;

/**
 *
 */
public class PostDecrementExpression extends UnaryExpression {

    public PostDecrementExpression(Statement statement, String operation) {
        super(statement, operation);
    }
}
