package com.dbelf.taintanalysis.ast.nodes.expressions.unary;

import com.dbelf.taintanalysis.ast.nodes.statements.Statement;

/**
 *
 */
public class PreDecrementExpression extends UnaryExpression {

    public PreDecrementExpression(Statement statement, String operation) {
        super(statement, operation);
    }
}
