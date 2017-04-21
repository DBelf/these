package com.dbelf.taintanalysis.ast.nodes.sourceelements;

import com.dbelf.taintanalysis.ast.nodes.Declaration;
import com.dbelf.taintanalysis.ast.nodes.expressions.ExpressionBlock;
import com.dbelf.taintanalysis.ast.nodes.expressions.Identifier;
import com.dbelf.taintanalysis.ast.nodes.statements.Statements;

/**
 *
 */
public class FunctionDeclaration extends Declaration {

    private Statements statements;

    public FunctionDeclaration(Identifier name, Statements statements) {
        super(name);
        this.statements = statements;
    }
}
