package com.dbelf.taintanalysis.ast.nodes.expressions.binary;

import com.dbelf.taintanalysis.ast.nodes.statements.Statement;
import com.dbelf.taintanalysis.visitors.ExpressionVisitor;

/**
 *
 */
public class BitOrExpression extends BinaryExpression {

    public BitOrExpression(Statement lhs, Statement rhs, String operation) {
        super(lhs, rhs, operation);
    }

    public <T> T accept(ExpressionVisitor<T> visitor) {
        return visitor.visit(this);
    }
}