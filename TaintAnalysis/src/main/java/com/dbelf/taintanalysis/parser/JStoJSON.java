package com.dbelf.taintanalysis.parser;


import jdk.nashorn.api.scripting.ScriptUtils;
import jdk.nashorn.internal.runtime.Context;
import jdk.nashorn.internal.runtime.ErrorManager;
import jdk.nashorn.internal.runtime.options.Options;
import org.json.JSONException;
import org.json.JSONObject;


/**
 *
 */
public class JStoJSON {
    Context contextm;

    public JStoJSON() {
        Options options = new Options("nashorn");
        ErrorManager errors = new ErrorManager();
        options.set("anon.functions", true);
        options.set("parse.only", true);
        options.set("scripting", true);

        Context contextm = new Context(options, errors, Thread.currentThread().getContextClassLoader());
        Context.setGlobal(contextm.createGlobal());
    }

    public JSONObject parse(String code) throws JSONException {
        String json = ScriptUtils.parse(code, "<unknown>", false);
        JSONObject obj;
        obj = new JSONObject(json);
        return obj;
    }
}
//For reference: https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API