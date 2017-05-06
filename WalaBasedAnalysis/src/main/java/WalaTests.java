import com.ibm.wala.cast.js.ipa.callgraph.JSCallGraphUtil;
import com.ibm.wala.cast.js.loader.JavaScriptLoader;
import com.ibm.wala.cast.js.ssa.JavaScriptInvoke;
import com.ibm.wala.cast.js.translator.CAstRhinoTranslatorFactory;
import com.ibm.wala.classLoader.CallSiteReference;
import com.ibm.wala.ipa.callgraph.*;
import com.ibm.wala.ipa.callgraph.propagation.InstanceKey;
import com.ibm.wala.ipa.callgraph.propagation.PointerAnalysis;
import com.ibm.wala.ipa.callgraph.propagation.PropagationCallGraphBuilder;
import com.ibm.wala.ipa.cfg.ExplodedInterproceduralCFG;
import com.ibm.wala.ipa.slicer.*;
import com.ibm.wala.ssa.*;
import com.ibm.wala.types.*;
import com.ibm.wala.util.CancelException;
import com.ibm.wala.util.WalaException;
import com.ibm.wala.util.debug.Assertions;
import com.ibm.wala.util.graph.traverse.BFSPathFinder;
import com.ibm.wala.util.intset.IntSet;
import com.ibm.wala.util.strings.Atom;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

/**
 *
 */
public class WalaTests {


    public static void main(String[] args) throws IOException, WalaException, IllegalArgumentException,
            CancelException {
        Path path = Paths.get(args[0]);

        FileInfo file = new FileInfo(path.getParent().toString(), path.getFileName().toString());

        BaseGraph bg = new BaseGraph(file);
        CGNode entry = bg.getFunctionNode(null);

        System.err.println("-----------------");

        bg.analyze();
//        System.err.println(bg.getSDG());
//        System.err.println(sdg);
    }
}



/*
* Het idee is dus dat ik zoek naar de "hot zones".
* Deze hot zones zijn function calls die onveilig zijn.
* Dus als een variable gezet wordt op iets dat user input heeft, is dat gevaarlijk.
*
* Source element accesses in een statement worden gemarkt als een "getfield" instructie.
* --Zoek uit wat voor soort accesses er nog meer zijn.
*
*
* */