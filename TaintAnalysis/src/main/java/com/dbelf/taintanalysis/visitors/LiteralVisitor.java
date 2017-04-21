package com.dbelf.taintanalysis.visitors;

import com.dbelf.taintanalysis.ast.nodes.literals.NumberLiteral;
import com.dbelf.taintanalysis.ast.nodes.literals.HexIntegerLiteral;
import com.dbelf.taintanalysis.ast.nodes.literals.OctalIntegerLiteral;

/**
 *
 */
public interface LiteralVisitor<T> {

    T visit(NumberLiteral numberLiteral);

    T visit(HexIntegerLiteral hexIntegerLiteral);

    T visit(OctalIntegerLiteral octalIntegerLiteral);
}
