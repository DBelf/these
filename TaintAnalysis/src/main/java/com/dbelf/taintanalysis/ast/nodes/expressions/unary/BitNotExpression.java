package com.dbelf.taintanalysis.ast.nodes.expressions.unary;

import com.dbelf.taintanalysis.ast.nodes.statements.Statement;
import com.dbelf.taintanalysis.visitors.ExpressionVisitor;

/**
 *
 */
public class BitNotExpression extends UnaryExpression {

    public BitNotExpression(Statement statement, String operation) {
        super(statement, operation);
    }

    public <T> T accept(ExpressionVisitor<T> visitor) {
        return visitor.visit(this);
    }
}
