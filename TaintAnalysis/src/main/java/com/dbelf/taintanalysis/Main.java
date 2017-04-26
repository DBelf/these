package com.dbelf.taintanalysis;


import com.dbelf.taintanalysis.ast.nodes.ASTNode;
import com.dbelf.taintanalysis.ast.nodes.Program;
import com.dbelf.taintanalysis.ast.visitor.ASTConstructor;
import com.dbelf.taintanalysis.ast.visitor.ASTVisualizer;
import org.antlr.v4.runtime.ANTLRInputStream;
import org.antlr.v4.runtime.CharStream;
import org.antlr.v4.runtime.CommonTokenStream;
import org.antlr.v4.runtime.tree.ParseTree;

import java.io.IOException;
import java.io.StringReader;

public class Main {
    public static void main(String[] args) throws IOException {
        String test = "function test(b) {if(true) {var c = 1;}}";

        // Create the parser.
        CharStream input = new ANTLRInputStream(test);
        ECMAScriptLexer lexer = new ECMAScriptLexer(input);
        CommonTokenStream tokens = new CommonTokenStream(lexer);
        ECMAScriptParser parser = new ECMAScriptParser(tokens);
        ParseTree tree = parser.program();

        ASTConstructor constructor = new ASTConstructor();
        Program root = (Program) tree.accept(constructor);

        ASTVisualizer visualizer = new ASTVisualizer();
        root.accept(visualizer);
        visualizer.visualize();
    }
}
