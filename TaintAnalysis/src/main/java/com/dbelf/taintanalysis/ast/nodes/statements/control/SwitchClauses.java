package com.dbelf.taintanalysis.ast.nodes.statements.control;

import com.dbelf.taintanalysis.ast.nodes.ASTNode;
import com.dbelf.taintanalysis.ast.nodes.statements.Statement;

import java.util.ArrayList;
import java.util.List;

/**
 *
 */
public class SwitchClauses implements ASTNode {

    private List<Clause> clauses;

    public SwitchClauses(){
        clauses = new ArrayList<Clause>();
    }

    public void add(Clause clause){
        clauses.add(clause);
    }

    public void add(SwitchClauses innerClauses) {
        clauses.addAll(innerClauses.getClauses());
    }

    public List<Clause> getClauses() {
        return clauses;
    }
}

