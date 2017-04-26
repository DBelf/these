package com.dbelf.taintanalysis.ast.nodes.statements;

import com.dbelf.taintanalysis.ast.nodes.expressions.Identifier;
import com.dbelf.taintanalysis.ast.nodes.statements.Statement;
import com.dbelf.taintanalysis.ast.nodes.statements.Statements;
import com.dbelf.taintanalysis.visitors.StatementVisitor;

/**
 *
 */
public class FunctionDeclaration extends Declaration {

    private Statements body;
    private ParameterList parameters;

    public FunctionDeclaration(Identifier name, ParameterList parameters, Statements statements) {
        super(name);
        this.parameters = parameters;
        this.body = statements;
    }

    public <T> T accept(StatementVisitor<T> visitor) {
        return visitor.visit(this);
    }

    public Statements body() {
        return this.body;
    }
}
