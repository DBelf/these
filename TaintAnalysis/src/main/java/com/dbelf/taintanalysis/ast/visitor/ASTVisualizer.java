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
import com.dbelf.taintanalysis.ast.nodes.statements.control.ForStatement;
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
import java.util.Stack;

/**
 *
 */
public class ASTVisualizer implements ProgramVisitor<Void>, StatementVisitor<String> {

    private DirectedGraph<String, DefaultEdge> graph;
    private Stack<String> scopeStack;

    public ASTVisualizer(){
        graph = new DefaultDirectedGraph<String, DefaultEdge>(DefaultEdge.class);
        scopeStack = new Stack<String>();
    }

    public Void visit(Program program) {
        String entry = "Entry";
        graph.addVertex(entry);
        scopeStack.push(entry);
        for (Statement statement : program.getStatements().getStatements()) {
            String stat = statement.accept(this);
            graph.addEdge(entry, stat);
        }
        scopeStack.pop();
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
        String condition = ifElseStatement.condition().accept(this);
        String ifClause = ifElseStatement.ifStatements().accept(this);

        graph.addVertex(condition);
        graph.addVertex(ifClause);
        graph.addEdge(condition, ifClause);

        if (ifElseStatement.hasElse()){
            String elseClause = ifElseStatement.elseStatements().accept(this);
            graph.addVertex(elseClause);
            graph.addEdge(condition, elseClause);
        }

        return condition;
    }

    public String visit(MultiplicativeExpression multiplicativeExpression) {
        String lhs = multiplicativeExpression.getLhs().accept(this);
        String rhs = multiplicativeExpression.getRhs().accept(this);
        String operation = multiplicativeExpression.getOparation();
        return lhs + " " + operation + " " + rhs;
    }

    public String visit(EqualityExpression equalityExpression) {
        String lhs = equalityExpression.getLhs().accept(this);
        String rhs = equalityExpression.getRhs().accept(this);
        String operation = equalityExpression.getOparation();
        return lhs + " " + operation + " " + rhs;
    }

    public String visit(AdditiveExpression additiveExpression) {
        String lhs = additiveExpression.getLhs().accept(this);
        String rhs = additiveExpression.getRhs().accept(this);
        String operation = additiveExpression.getOparation();
        return lhs + " " + operation + " " + rhs;
    }

    public String visit(AssignmentOperatorExpression assignmentOperatorExpression) {
        return null;
    }

    public String visit(BitAndExpression bitAndExpression) {
        String lhs = bitAndExpression.getLhs().accept(this);
        String rhs = bitAndExpression.getRhs().accept(this);
        String operation = bitAndExpression.getOparation();
        return lhs + " " + operation + " " + rhs;
    }

    public String visit(BitOrExpression bitOrExpression) {
        String lhs = bitOrExpression.getLhs().accept(this);
        String rhs = bitOrExpression.getRhs().accept(this);
        String operation = bitOrExpression.getOparation();
        return lhs + " " + operation + " " + rhs;
    }

    public String visit(BitShiftExpression bitShiftExpression) {
        String lhs = bitShiftExpression.getLhs().accept(this);
        String rhs = bitShiftExpression.getRhs().accept(this);
        String operation = bitShiftExpression.getOparation();
        return lhs + " " + operation + " " + rhs;
    }

    public String visit(BitXOrExpression bitXOrExpression) {
        String lhs = bitXOrExpression.getLhs().accept(this);
        String rhs = bitXOrExpression.getRhs().accept(this);
        String operation = bitXOrExpression.getOparation();
        return lhs + " " + operation + " " + rhs;
    }

    public String visit(LogicalAndExpression logicalAndExpression) {
        String lhs = logicalAndExpression.getLhs().accept(this);
        String rhs = logicalAndExpression.getRhs().accept(this);
        String operation = logicalAndExpression.getOparation();
        return lhs + " " + operation + " " + rhs;
    }

    public String visit(LogicalOrExpression logicalOrExpression) {
        String lhs = logicalOrExpression.getLhs().accept(this);
        String rhs = logicalOrExpression.getRhs().accept(this);
        String operation = logicalOrExpression.getOparation();
        return lhs + " " + operation + " " + rhs;
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

        String declaration = "var " + identifier + " = " + expression;
        graph.addVertex(declaration);
        return declaration;
    }

    public String visit(Switch switchstatement) {
        return null;
    }

    public String visit(FunctionDeclaration functionDeclaration) {

        String name = functionDeclaration.name();
        scopeStack.push(name);
        String body = functionDeclaration.body().accept(this);
        graph.addVertex(name);
        graph.addEdge(name, body);
        scopeStack.pop();
        return name;
    }

    public String visit(Statements statements) {
        String statementBlock = scopeStack.peek();
        graph.addVertex(statementBlock);
        for (Statement statement : statements.getStatements()){
            String statementString = statement.accept(this);
            graph.addVertex(statementString);
            graph.addEdge(statementBlock, statementString);
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

    public String visit(ForStatement forStatement) {
        return null;
    }
}
