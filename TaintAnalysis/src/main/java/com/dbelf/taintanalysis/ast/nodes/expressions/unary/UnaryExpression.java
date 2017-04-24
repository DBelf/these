package com.dbelf.taintanalysis.ast.nodes.expressions.unary;


import com.dbelf.taintanalysis.ast.nodes.expressions.Expression;
import com.dbelf.taintanalysis.ast.nodes.statements.Statement;

/**
 *
 */
public abstract class UnaryExpression implements Expression {
    Statement expression;
    String operation;

    public UnaryExpression(Statement expression, String operation){
        this.expression = expression;
        this.operation = operation;
    }
}
