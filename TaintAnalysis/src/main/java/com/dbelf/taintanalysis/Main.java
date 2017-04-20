package com.dbelf.taintanalysis;


import com.dbelf.taintanalysis.ast.ASTConstructor;
import org.antlr.v4.runtime.ANTLRInputStream;
import org.antlr.v4.runtime.CommonTokenStream;
import org.antlr.v4.runtime.misc.NotNull;
import org.antlr.v4.runtime.tree.ParseTree;
import org.antlr.v4.runtime.tree.ParseTreeWalker;

import java.io.IOException;
import java.io.StringReader;

public class Main {
    public static void main(String[] args) throws IOException {
        String test = " function b () {var a = 5.0; var c = 3.1;}";

        // Create the parser.
        ANTLRInputStream input = new ANTLRInputStream(new StringReader(test));
        ECMAScriptLexer lexer = new ECMAScriptLexer(input);
        CommonTokenStream tokens = new CommonTokenStream(lexer);
        ECMAScriptParser parser = new ECMAScriptParser(tokens);
        ParseTree tree = parser.program();

        ASTConstructor constructor = new ASTConstructor();
        tree.accept(constructor);

    }
}
