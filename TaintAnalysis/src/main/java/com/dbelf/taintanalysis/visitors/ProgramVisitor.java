package com.dbelf.taintanalysis.visitors;

import com.dbelf.taintanalysis.ast.nodes.Program;

/**
 *
 */
public interface ProgramVisitor<T> {
    T visit(Program program);
}
