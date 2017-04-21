package com.dbelf.taintanalysis.ast.nodes.statements;

import com.dbelf.taintanalysis.ast.nodes.ASTNode;
import com.dbelf.taintanalysis.ast.nodes.expressions.Identifier;
import com.dbelf.taintanalysis.visitors.StatementVisitor;

/**
 *
 */
public class VariableDeclaration extends Declaration {
    private ASTNode value;

    public VariableDeclaration(Identifier name, ASTNode value) {
        super(name);
        this.value = value;
    }

    public <T> T accept(StatementVisitor<T> visitor) { return visitor.visit(this); }
}
