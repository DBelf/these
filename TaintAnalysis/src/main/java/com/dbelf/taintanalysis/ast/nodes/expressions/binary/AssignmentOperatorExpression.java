package com.dbelf.taintanalysis.ast.nodes.expressions.binary;

import com.dbelf.taintanalysis.ast.nodes.statements.Statement;

/**
 *
 */
public class AssignmentOperatorExpression extends BinaryExpression {

    public AssignmentOperatorExpression(Statement lhs, Statement rhs, String operation) {
        super(lhs, rhs, operation);
    }
}
