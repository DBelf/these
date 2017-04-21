package com.dbelf.taintanalysis.ast.nodes;

import com.dbelf.taintanalysis.ast.nodes.ASTNode;
import com.dbelf.taintanalysis.ast.nodes.expressions.Expression;
import com.dbelf.taintanalysis.ast.nodes.expressions.Identifier;
import com.dbelf.taintanalysis.ast.nodes.statements.Statement;
import com.dbelf.taintanalysis.visitors.StatementVisitor;

/**
 *
 */
public abstract class Declaration implements Statement {
    Identifier name;

    public Declaration(Identifier name) {
        this.name = name;
    }
}
