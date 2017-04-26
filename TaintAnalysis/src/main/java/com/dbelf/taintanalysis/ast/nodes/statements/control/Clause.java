package com.dbelf.taintanalysis.ast.nodes.statements.control;

import com.dbelf.taintanalysis.ast.nodes.ASTNode;
import com.dbelf.taintanalysis.ast.nodes.statements.Statement;

/**
 *
 */
public class Clause implements ASTNode {
    Statement clause;
    Statement block;

    public Clause(Statement clause, Statement block) {
        this.clause = clause;
        this.block = block;
    }

}
