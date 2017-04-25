package com.dbelf.taintanalysis.ast.nodes.expressions.binary;

import com.dbelf.taintanalysis.ast.nodes.statements.Statement;
import com.dbelf.taintanalysis.visitors.StatementVisitor;

/**
 *
 */
public class MultiplicativeExpression extends BinaryExpression {

    public MultiplicativeExpression(Statement lhs, Statement rhs, String operation){
        super(lhs, rhs, operation);
    }

    public <T> T accept(StatementVisitor<T> visitor) {
        return visitor.visit(this);
    }

}//TODO should I make different types?

