package com.dbelf.taintanalysis.ast.nodes.statements;

import com.dbelf.taintanalysis.ast.nodes.expressions.Expression;
import com.dbelf.taintanalysis.ast.nodes.expressions.Identifier;
import com.dbelf.taintanalysis.visitors.StatementVisitor;

/**
 *
 */
public class Declaration implements Statement {
    Identifier name;
    Expression expression;

    public Declaration(Identifier name, Expression expression) {
        this.name = name;
        this.expression = expression;
    }

    public <T> T accept(StatementVisitor<T> visitor) { return visitor.visit(this); }
}
