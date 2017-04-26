package com.dbelf.taintanalysis.ast.visitor;

import com.dbelf.taintanalysis.ast.nodes.Program;
import com.dbelf.taintanalysis.ast.nodes.expressions.Identifier;
import com.dbelf.taintanalysis.ast.nodes.expressions.binary.*;
import com.dbelf.taintanalysis.ast.nodes.expressions.literals.*;
import com.dbelf.taintanalysis.ast.nodes.expressions.unary.*;
import com.dbelf.taintanalysis.ast.nodes.statements.FunctionDeclaration;
import com.dbelf.taintanalysis.ast.nodes.statements.Statement;
import com.dbelf.taintanalysis.ast.nodes.statements.Statements;
import com.dbelf.taintanalysis.ast.nodes.statements.VariableDeclaration;
import com.dbelf.taintanalysis.ast.nodes.statements.control.IfElseStatement;
import com.dbelf.taintanalysis.ast.nodes.statements.control.Switch;
import com.dbelf.taintanalysis.visitors.ProgramVisitor;
import com.dbelf.taintanalysis.visitors.StatementVisitor;
import com.mxgraph.layout.mxCircleLayout;
import com.mxgraph.layout.mxCompactTreeLayout;
import com.mxgraph.layout.mxIGraphLayout;
import com.mxgraph.layout.mxOrganicLayout;
import com.mxgraph.swing.mxGraphComponent;
import com.mxgraph.util.mxConstants;
import org.jgrapht.DirectedGraph;
import org.jgrapht.ext.JGraphXAdapter;
import org.jgrapht.graph.DefaultDirectedGraph;
import org.jgrapht.graph.DefaultEdge;

import javax.swing.*;

/**
 *
 */
public class ASTVisualizer implements ProgramVisitor<Void>, StatementVisitor<String> {

    private DirectedGraph<String, DefaultEdge> graph;

    public ASTVisualizer(){
        graph = new DefaultDirectedGraph<String, DefaultEdge>(DefaultEdge.class);

    }

    public Void visit(Program program) {
        String entry = "Entry";
        graph.addVertex(entry);
        for (Statement statement : program.getStatements().getStatements()) {
            String stat = statement.accept(this);
            graph.addVertex(stat);
            graph.addEdge(entry, stat);
        }
        return null;
    }

    public void visualize() {
        JFrame frame = new JFrame("Program AST");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        JGraphXAdapter<String, DefaultEdge> graphAdapter =
                new JGraphXAdapter<String, DefaultEdge>(graph);

        graphAdapter.getStylesheet().getDefaultEdgeStyle().put(mxConstants.STYLE_NOLABEL, "1");
        mxIGraphLayout layout = new mxCompactTreeLayout(graphAdapter);
        layout.execute(graphAdapter.getDefaultParent());

        frame.add(new mxGraphComponent(graphAdapter));

        frame.pack();
        frame.setLocationByPlatform(true);
        frame.setVisible(true);

    }

    public String visit(Identifier identifier) {
        return identifier.toString();
    }

    public String visit(IfElseStatement ifElseStatement) {
        return null;
    }

    public String visit(MultiplicativeExpression multiplicativeExpression) {
        return null;
    }

    public String visit(EqualityExpression equalityExpression) {
        return null;
    }

    public String visit(AdditiveExpression additiveExpression) {
        return null;
    }

    public String visit(AssignmentOperatorExpression assignmentOperatorExpression) {
        return null;
    }

    public String visit(BitAndExpression bitAndExpression) {
        return null;
    }

    public String visit(BitOrExpression bitOrExpression) {
        return null;
    }

    public String visit(BitShiftExpression bitShiftExpression) {
        return null;
    }

    public String visit(BitXOrExpression bitXOrExpression) {
        return null;
    }

    public String visit(LogicalAndExpression logicalAndExpression) {
        return null;
    }

    public String visit(LogicalOrExpression logicalOrExpression) {
        return null;
    }

    public String visit(RelationalExpression relationalExpression) {
        return null;
    }

    public String visit(BitNotExpression bitNotExpression) {
        return null;
    }

    public String visit(NotExpression notExpression) {
        return null;
    }

    public String visit(PostDecrementExpression postDecrementExpression) {
        return null;
    }

    public String visit(PostIncrementExpression postIncrementExpression) {
        return null;
    }

    public String visit(PreDecrementExpression preDecrementExpression) {
        return null;
    }

    public String visit(UnaryMinus unaryMinus) {
        return null;
    }

    public String visit(UnaryPlusExpression unaryPlusExpression) {
        return null;
    }

    public String visit(PreIncrementExpression preIncrementExpression) {
        return null;
    }

    public String visit(VariableDeclaration variableDeclaration) {
        String identifier = variableDeclaration.name();
        String expression = variableDeclaration.value().accept(this);

        return "var " + identifier + " = " + expression;
    }

    public String visit(Switch switchstatement) {
        return null;
    }

    public String visit(FunctionDeclaration functionDeclaration) {
        String name = functionDeclaration.name();
        String body = functionDeclaration.body().accept(this);
        graph.addVertex(name);
        graph.addVertex(body);
        graph.addEdge(name, body);
        return name;
    }

    public String visit(Statements statements) {
        String statementBlock = "";
        for (Statement statement : statements.getStatements()){
            statementBlock += statement.accept(this) + "\n";
        }
        return statementBlock;
    }

    public String visit(NumberLiteral numberLiteral) {
        return numberLiteral.toString();
    }

    public String visit(HexIntegerLiteral hexIntegerLiteral) {
        return hexIntegerLiteral.toString();
    }

    public String visit(OctalIntegerLiteral octalIntegerLiteral) {
        return octalIntegerLiteral.toString();
    }

    public String visit(StringLiteral stringLiteral) {
        return stringLiteral.toString();
    }

    public String visit(BooleanLiteral booleanLiteral) {
        return booleanLiteral.toString();
    }

    public String visit(NullLiteral nullLiteral) {
        return nullLiteral.toString();
    }
}
