package com.dbelf.taintanalysis.ast.nodes.sourceelements;

import com.dbelf.taintanalysis.ast.nodes.expressions.Identifier;
import com.dbelf.taintanalysis.ast.nodes.statements.Statement;
import com.dbelf.taintanalysis.ast.nodes.statements.Statements;

/**
 *
 */
public class FunctionDeclaration implements Statement {

    private Identifier name;
    private Statements statements;

    public FunctionDeclaration(Identifier name, Statements statements) {
        this.name = name;
        this.statements = statements;
    }
}
