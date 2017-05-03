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
import com.ibm.wala.ipa.slicer.NormalStatement;
import com.ibm.wala.ipa.slicer.SDG;
import com.ibm.wala.ipa.slicer.Slicer;
import com.ibm.wala.ipa.slicer.Statement;
import com.ibm.wala.ssa.*;
import com.ibm.wala.types.*;
import com.ibm.wala.util.CancelException;
import com.ibm.wala.util.WalaException;
import com.ibm.wala.util.debug.Assertions;
import com.ibm.wala.util.graph.traverse.BFSPathFinder;
import com.ibm.wala.util.intset.IntSet;
import com.ibm.wala.util.strings.Atom;
import taintgraph.BaseGraph;
import taintgraph.FileInfo;
import taintgraph.Print;

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
//        bg.printInstructions(entry);

        SDG<InstanceKey> sdg = bg.sdg(Slicer.DataDependenceOptions.NO_BASE_NO_HEAP, Slicer.ControlDependenceOptions.NONE);
        Atom funAtom = Atom.findOrCreateUnicodeAtom("do");
        NormalStatement source = null;
        NormalStatement exit = null;
        for (Statement src : sdg) {
            if (src.getNode().getMethod().toString().contains("Lassign")){
//                System.err.println(src);
                if (src.getKind() == Statement.Kind.NORMAL){
                    NormalStatement s = (NormalStatement) src;
                    if(s.toString().contains("getfield")) {
                        System.err.println(s);
                        source = s;
                    }
                    if (s.toString().contains("eval")){
                        System.err.print(s);
                        exit = s;
                    }
//

                }
            }


        }
        BFSPathFinder<Statement> paths = new BFSPathFinder<Statement>(sdg, source, exit);
        List<Statement> shortPath = paths.find();
        System.err.println(shortPath);
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