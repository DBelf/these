package com.dbelf.taintanalysis.ast.visitor;

import com.dbelf.taintanalysis.ast.nodes.Program;
import com.dbelf.taintanalysis.visitors.ProgramVisitor;
import com.mxgraph.layout.mxCircleLayout;
import com.mxgraph.layout.mxIGraphLayout;
import com.mxgraph.swing.mxGraphComponent;
import org.jgrapht.DirectedGraph;
import org.jgrapht.ext.JGraphXAdapter;
import org.jgrapht.graph.DefaultDirectedGraph;
import org.jgrapht.graph.DefaultEdge;

import javax.swing.*;

/**
 *
 */
public class ASTVisualizer implements ProgramVisitor<Void> {

    private DirectedGraph<String, DefaultEdge> graph;

    public ASTVisualizer(){
        graph = new DefaultDirectedGraph<String, DefaultEdge>(DefaultEdge.class);
    }

    public Void visit(Program program) {
        String statement = "a = 1";
        graph.addVertex("Entry");
        graph.addVertex(statement);
        graph.addEdge("Entry", statement);
        return null;
    }

    public void visualize() {
        JFrame frame = new JFrame("Program AST");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        JGraphXAdapter<String, DefaultEdge> graphAdapter =
                new JGraphXAdapter<String, DefaultEdge>(graph);

        mxIGraphLayout layout = new mxCircleLayout(graphAdapter);
        layout.execute(graphAdapter.getDefaultParent());

        frame.add(new mxGraphComponent(graphAdapter));

        frame.pack();
        frame.setLocationByPlatform(true);
        frame.setVisible(true);
    }
}
