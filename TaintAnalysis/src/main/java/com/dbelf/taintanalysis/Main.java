package com.dbelf.taintanalysis;

import com.dbelf.taintanalysis.parser.JStoJSON;
import org.json.JSONException;

public class Main {
    public static void main(String[] args) {
        String test = "1+1";
        JStoJSON parser = new JStoJSON();
        try {
            System.out.println(parser.parse(test));
        } catch (JSONException e){
            System.err.println(e.getMessage());
        }
    }
}
