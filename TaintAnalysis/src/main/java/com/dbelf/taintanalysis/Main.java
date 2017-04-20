package com.dbelf.taintanalysis;


import org.antlr.v4.runtime.ANTLRInputStream;
import org.antlr.v4.runtime.CommonTokenStream;
import org.antlr.v4.runtime.misc.NotNull;
import org.antlr.v4.runtime.tree.ParseTreeWalker;

import java.io.IOException;
import java.io.StringReader;

public class Main {
    public static void main(String[] args) throws IOException {
        String test = "var a = 5.0;";

        // Create the parser.
        ANTLRInputStream input = new ANTLRInputStream(new StringReader(test));
        ECMAScriptLexer lexer = new ECMAScriptLexer(input);
        CommonTokenStream tokens = new CommonTokenStream(lexer);
        ECMAScriptParser parser = new ECMAScriptParser(tokens);

        // Walk the parse tree and listen when the `literal` is being entered.
        ParseTreeWalker.DEFAULT.walk(new ECMAScriptBaseListener(){
            @Override
            public void enterLiteral(@NotNull ECMAScriptParser.LiteralContext ctx) {
                if (ctx.RegularExpressionLiteral() != null) {
                    System.out.println("regex: " + ctx.RegularExpressionLiteral().getText());
                }
            }

            @Override
            public void enterNumericLiteral(@NotNull ECMAScriptParser.NumericLiteralContext ctx) {
                if (ctx.DecimalLiteral() != null) {
                    System.out.println("Decimal: " + ctx.DecimalLiteral().getText());
                }
            }
        }, parser.program());
    }
}
