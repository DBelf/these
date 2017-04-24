package com.dbelf.taintanalysis.ast.nodes.statements;

import com.dbelf.taintanalysis.ast.nodes.expressions.Identifier;
import com.dbelf.taintanalysis.ast.nodes.statements.Statement;
import com.dbelf.taintanalysis.ast.nodes.statements.Statements;

/**
 *
 */
public class FunctionDeclaration implements Statement {

    private Identifier name;
    private Statements statements;
    private ParameterList parameters;

    public FunctionDeclaration(Identifier name, ParameterList parameters, Statements statements) {
        this.name = name;
        this.parameters = parameters;
        this.statements = statements;
    }
}
