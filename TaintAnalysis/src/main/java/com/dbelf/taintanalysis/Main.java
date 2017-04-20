package com.dbelf.taintanalysis;

import com.dbelf.taintanalysis.parser.JStoJSON;
import org.json.JSONException;
import org.json.JSONObject;

public class Main {
    public static void main(String[] args) {
        String test = "function a() { var b = 5; } function c() { }";
        JStoJSON parser = new JStoJSON();
        try {
            JSONObject tmp = parser.parse(test);
            for (Object prop : tmp){

            }
            System.out.println(tmp.get("body"));
        } catch (JSONException e){
            System.err.println(e.getMessage());
        }
    }
}
