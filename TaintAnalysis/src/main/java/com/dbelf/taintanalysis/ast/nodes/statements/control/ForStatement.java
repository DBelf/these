package com.dbelf.taintanalysis.ast.nodes.statements.control;

import com.dbelf.taintanalysis.ast.nodes.statements.Statement;
import com.dbelf.taintanalysis.ast.nodes.statements.Statements;
import com.dbelf.taintanalysis.visitors.StatementVisitor;

/**
 *
 */
public class ForStatement implements Statement {

    private ForHeader forHeader;
    private Statement forBody;

    public ForStatement(Statements forHeader, Statement forBody) {
        this.forHeader = new ForHeader(forHeader);
        this.forBody = forBody;
    }

    public <T> T accept(StatementVisitor<T> visitor) {
        return visitor.visit(this);
    }
}
