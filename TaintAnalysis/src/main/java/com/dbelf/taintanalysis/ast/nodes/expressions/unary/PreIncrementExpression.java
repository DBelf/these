package com.dbelf.taintanalysis.ast.nodes.expressions.unary;

import com.dbelf.taintanalysis.ast.nodes.statements.Statement;
import com.dbelf.taintanalysis.visitors.StatementVisitor;

/**
 *
 */
public class PreIncrementExpression extends UnaryExpression {

    public PreIncrementExpression(Statement statement, String operation) {
        super(statement, operation);
    }

    public <T> T accept(StatementVisitor<T> visitor) {
        return visitor.visit(this);
    }
}
