package com.dbelf.taintanalysis.ast.nodes.expressions.unary;

import com.dbelf.taintanalysis.ast.nodes.statements.Statement;

/**
 *
 */
public class PostIncrementExpression extends UnaryExpression {

    public PostIncrementExpression(Statement statement, String operation) {
        super(statement, operation);
    }
}
