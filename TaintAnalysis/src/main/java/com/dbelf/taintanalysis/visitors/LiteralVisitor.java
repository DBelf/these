package com.dbelf.taintanalysis.visitors;

import com.dbelf.taintanalysis.ast.nodes.literals.*;

/**
 *
 */
public interface LiteralVisitor<T> {

    T visit(NumberLiteral numberLiteral);

    T visit(HexIntegerLiteral hexIntegerLiteral);

    T visit(OctalIntegerLiteral octalIntegerLiteral);

    T visit(StringLiteral stringLiteral);

    T visit(BooleanLiteral booleanLiteral);
}
