package com.dbelf.taintanalysis.ast.nodes.statements;

import com.dbelf.taintanalysis.ast.nodes.ASTNode;
import com.dbelf.taintanalysis.ast.nodes.expressions.Expression;
import com.dbelf.taintanalysis.ast.nodes.expressions.Identifier;
import com.dbelf.taintanalysis.visitors.StatementVisitor;

/**
 *
 */
public class Declaration implements Statement {
    Identifier name;
    ASTNode value;

    public Declaration(Identifier name, ASTNode value) {
        this.name = name;
        this.value = value;
    }

    public <T> T accept(StatementVisitor<T> visitor) { return visitor.visit(this); }
}
