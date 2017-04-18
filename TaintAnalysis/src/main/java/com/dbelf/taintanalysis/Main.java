package com.dbelf.taintanalysis;

import com.dbelf.taintanalysis.parser.JStoJSON;

public class Main {
    public static void main(String[] args) {
        String test = "1+1";
        JStoJSON parser = new JStoJSON();
        System.out.println(parser.parse(test));

    }
}
