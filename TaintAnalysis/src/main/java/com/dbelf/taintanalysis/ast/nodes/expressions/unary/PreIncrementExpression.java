package com.dbelf.taintanalysis.ast.nodes.expressions.unary;

import com.dbelf.taintanalysis.ast.nodes.statements.Statement;

/**
 *
 */
public class PreIncrementExpression extends UnaryExpression {

    public PreIncrementExpression(Statement statement, String operation) {
        super(statement, operation);
    }
}
