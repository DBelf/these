package com.dbelf.taintanalysis.visitors;

import com.dbelf.taintanalysis.ast.nodes.statements.control.Switch;
import com.dbelf.taintanalysis.ast.nodes.statements.VariableDeclaration;

/**
 *
 */
public interface StatementVisitor<T> {

    T visit(VariableDeclaration variableDeclaration);

    T visit(Switch switchstatement);
}
