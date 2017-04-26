package com.dbelf.taintanalysis.ast.nodes.statements;

import com.dbelf.taintanalysis.ast.nodes.ASTNode;
import com.dbelf.taintanalysis.ast.nodes.expressions.Identifier;

import java.util.ArrayList;
import java.util.List;

/**
 *
 */
public class ParameterList implements ASTNode{
    private List<Identifier> identifiers;

    public ParameterList() {
        this.identifiers = new ArrayList<Identifier>();
    }

    public void add(Identifier identifier) {
        this.identifiers.add(identifier);
    }

    //TODO should I add a visitor?
}
