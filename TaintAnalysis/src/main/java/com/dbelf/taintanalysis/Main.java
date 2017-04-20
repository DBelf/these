package com.dbelf.taintanalysis;


import com.dbelf.taintanalysis.ast.ASTConstructor;
import org.antlr.v4.runtime.ANTLRInputStream;
import org.antlr.v4.runtime.CommonTokenStream;
import org.antlr.v4.runtime.tree.ParseTree;


import java.io.IOException;
import java.io.StringReader;

public class Main {
    public static void main(String[] args) throws IOException {
        String test = " test =\"What is all this?\"\n" +
                "\n" +
                "// opens document and uses methods to modify text characteristics\n" +
                "document.open()\n" +
                "document.write(test.bold()+\"<P>\")\n" +
                "document.write(test.fontsize(7)+\"<P>\")\n" +
                "document.write(test.fontcolor(\"red\")+\"<P>\")\n" +
                "document.write(test.toUpperCase()+\"<P>\")\n" +
                "\n" +
                "//assigns multiple characteristics to text\n" +
                "document.write(test.italics().fontsize(6).fontcolor(\"green\")+\"<P>\")\n" +
                "document.open()";

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
