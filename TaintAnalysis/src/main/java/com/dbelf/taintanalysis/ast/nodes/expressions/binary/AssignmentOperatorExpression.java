package com.dbelf.taintanalysis.ast.nodes.expressions.binary;

import com.dbelf.taintanalysis.ast.nodes.statements.Statement;
import com.dbelf.taintanalysis.visitors.StatementVisitor;

/**
 *
 */
public class AssignmentOperatorExpression extends BinaryExpression {

    public AssignmentOperatorExpression(Statement lhs, Statement rhs, String operation) {
        super(lhs, rhs, operation);
    }

    public <T> T accept(StatementVisitor<T> visitor) {
        return visitor.visit(this);
    }
}
