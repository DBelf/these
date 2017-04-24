package com.dbelf.taintanalysis.visitors;

import com.dbelf.taintanalysis.ast.nodes.statements.FunctionDeclaration;
import com.dbelf.taintanalysis.ast.nodes.statements.Statements;
import com.dbelf.taintanalysis.ast.nodes.statements.control.Switch;
import com.dbelf.taintanalysis.ast.nodes.statements.VariableDeclaration;

/**
 *
 */
public interface StatementVisitor<T> {

    T visit(VariableDeclaration variableDeclaration);

    T visit(Switch switchstatement);

    T visit(FunctionDeclaration functionDeclaration);

    T visit(Statements statements);
}
