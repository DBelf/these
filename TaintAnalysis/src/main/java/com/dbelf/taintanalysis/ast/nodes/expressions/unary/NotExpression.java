package com.dbelf.taintanalysis.ast.nodes.expressions.unary;

import com.dbelf.taintanalysis.ast.nodes.statements.Statement;

/**
 *
 */
public class NotExpression extends UnaryExpression {

    public NotExpression(Statement statement, String operation) {
        super(statement, operation);
    }
}
