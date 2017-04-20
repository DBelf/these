package com.dbelf.taintanalysis.visitors;

import com.dbelf.taintanalysis.ast.nodes.literals.DecimalLiteral;
import com.dbelf.taintanalysis.ast.nodes.literals.HexIntegerLiteral;
import com.dbelf.taintanalysis.ast.nodes.literals.OctalIntegerLiteral;

/**
 *
 */
public interface LiteralVisitor<T> {

    T visit(DecimalLiteral decimalLiteral);

    T visit(HexIntegerLiteral hexIntegerLiteral);

    T visit(OctalIntegerLiteral octalIntegerLiteral);
}
