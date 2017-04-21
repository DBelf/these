package com.dbelf.taintanalysis.ast.nodes.expressions;

import java.util.ArrayList;
import java.util.List;

/**
 *
 */
public class ExpressionBlock implements Expression {
    List<Expression> expressions;

    public ExpressionBlock(){
        expressions = new ArrayList<Expression>();
    }

    public void add(Expression expression){
        expressions.add(expression);
    }
}
