package com.dbelf.taintanalysis.ast.nodes.statements.control;

import com.dbelf.taintanalysis.ast.nodes.statements.Statements;

/**
 *
 */
public class ForHeader {
    private Statements statements;

    public ForHeader(Statements statements) {
        this.statements = statements;
    }
}
