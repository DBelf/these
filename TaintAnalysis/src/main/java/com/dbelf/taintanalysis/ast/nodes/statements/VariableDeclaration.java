package com.dbelf.taintanalysis.ast.nodes.statements;

import com.dbelf.taintanalysis.ast.nodes.ASTNode;
import com.dbelf.taintanalysis.ast.nodes.Declaration;
import com.dbelf.taintanalysis.ast.nodes.expressions.Identifier;

/**
 *
 */
public class VariableDeclaration extends Declaration {
    private ASTNode value;

    public VariableDeclaration(Identifier name, ASTNode value) {
        super(name);
        this.value = value;
    }
}
