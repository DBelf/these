package com.dbelf.taintanalysis.ast.nodes.statements;

import com.dbelf.taintanalysis.ast.nodes.ASTNode;
import com.dbelf.taintanalysis.visitors.StatementVisitor;

/**
 *
 */
public interface Statement extends ASTNode {

    <T> T accept(StatementVisitor<T> visitor);
}
