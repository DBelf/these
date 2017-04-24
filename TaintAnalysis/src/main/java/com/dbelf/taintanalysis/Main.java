package com.dbelf.taintanalysis;


import com.dbelf.taintanalysis.ast.nodes.ASTNode;
import com.dbelf.taintanalysis.ast.visitor.ASTConstructor;
import org.antlr.v4.runtime.ANTLRInputStream;
import org.antlr.v4.runtime.CommonTokenStream;
import org.antlr.v4.runtime.tree.ParseTree;

import java.io.IOException;
import java.io.StringReader;

public class Main {
    public static void main(String[] args) throws IOException {
        String test = "function a(bla) {if (true) {var a = 1;};}";

        // Create the parser.
        ANTLRInputStream input = new ANTLRInputStream(new StringReader(test));
        ECMAScriptLexer lexer = new ECMAScriptLexer(input);
        CommonTokenStream tokens = new CommonTokenStream(lexer);
        ECMAScriptParser parser = new ECMAScriptParser(tokens);
        ParseTree tree = parser.program();

        ASTConstructor constructor = new ASTConstructor();
        ASTNode root = tree.accept(constructor);
        System.out.println(root);
    }
}
