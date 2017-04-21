package com.dbelf.taintanalysis.visitors;

import com.dbelf.taintanalysis.ast.nodes.statements.Declaration;
import com.dbelf.taintanalysis.ast.nodes.statements.Switch;

/**
 *
 */
public interface StatementVisitor<T> {

    T visit(Declaration declaration);

    T visit(Switch switchstatement);
}
