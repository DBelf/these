package taintgraph;

import com.ibm.wala.cast.js.ipa.callgraph.JSCallGraphUtil;
import com.ibm.wala.cast.js.ipa.modref.JavaScriptModRef;
import com.ibm.wala.cast.js.loader.JavaScriptLoader;
import com.ibm.wala.cast.js.ssa.JavaScriptInvoke;
import com.ibm.wala.cast.js.translator.CAstRhinoTranslatorFactory;
import com.ibm.wala.classLoader.CallSiteReference;
import com.ibm.wala.ipa.callgraph.CGNode;
import com.ibm.wala.ipa.callgraph.CallGraph;
import com.ibm.wala.ipa.callgraph.CallGraphBuilder;
import com.ibm.wala.ipa.callgraph.propagation.InstanceKey;
import com.ibm.wala.ipa.callgraph.propagation.PropagationCallGraphBuilder;
import com.ibm.wala.ipa.slicer.NormalStatement;
import com.ibm.wala.ipa.slicer.SDG;
import com.ibm.wala.ipa.slicer.Slicer;
import com.ibm.wala.ipa.slicer.Statement;
import com.ibm.wala.ssa.*;
import com.ibm.wala.types.TypeName;
import com.ibm.wala.types.TypeReference;
import com.ibm.wala.util.CancelException;
import com.ibm.wala.util.WalaException;
import com.ibm.wala.util.debug.Assertions;
import com.ibm.wala.util.graph.traverse.BFSPathFinder;
import com.ibm.wala.util.intset.IntSet;
import com.ibm.wala.util.strings.Atom;

import java.io.IOException;
import java.util.Iterator;
import java.util.List;

/**
 *
 */
public class BaseGraph {

    private FileInfo file;
    private PropagationCallGraphBuilder cgb;
    private CallGraph cg;

    public BaseGraph(FileInfo file) throws IOException, WalaException, CancelException {
        this.file = file;

        JSCallGraphUtil.setTranslatorFactory(new CAstRhinoTranslatorFactory());

        cgb = JSCallGraphBuilderUtil.makeScriptCGBuilder(file.getRoot(), file.getName());
        this.cg = cgb.makeCallGraph(cgb.getOptions());
    }

    public SDG<InstanceKey> sdg(Slicer.DataDependenceOptions data, Slicer.ControlDependenceOptions control) {
        return new SDG<InstanceKey>(cg, cgb.getPointerAnalysis(), new JavaScriptModRef<InstanceKey>(), data, control);
    }

    public void printInstructions(CGNode node) {
        IR ir = node.getIR();

        // Get CFG from IR
        SSACFG cfg = ir.getControlFlowGraph();

        // Iterate over the Basic Blocks of CFG
        Iterator<ISSABasicBlock> cfgIt = cfg.iterator();
        while (cfgIt.hasNext()) {
            ISSABasicBlock ssaBb = cfgIt.next();

            // Iterate over SSA Instructions for a Basic Block
            Iterator<SSAInstruction> ssaIt = ssaBb.iterator();
            while (ssaIt.hasNext()) {
                SSAInstruction ssaInstr = ssaIt.next();
                //Print out the instruction
                System.err.println(ssaInstr);
            }
        }
    }

    public CGNode getFunctionNode(String moduleName) {
        Atom funAtom = Atom.findOrCreateUnicodeAtom("do");
        String decClassName = (moduleName == null) ? "L" + file.getName() : "L" + file.getName() + "/" + moduleName;

        for (Iterator<? extends CGNode> it = cg.iterator(); it.hasNext();) {
            CGNode n = it.next();
            //If it's a defined function invocation
            if (n.getMethod().getName().equals(funAtom)) {
                //Check whether the function name matches to the one we're searching.
                TypeReference decCls = n.getMethod().getReference().getDeclaringClass();
                if (decCls.getName().toString().equals(decClassName)) {
                    return n;
                }
            }
        }

        System.err.println("call graph " + cg);
        Assertions.UNREACHABLE("failed to find method " + decClassName);
        return null;
    }

    public Statement findCallTo(CGNode n, String methodName) {
        IR ir = n.getIR();
        SymbolTable table = ir.getSymbolTable();
        for (Iterator<SSAInstruction> it = ir.iterateAllInstructions(); it.hasNext();) {
            SSAInstruction s = it.next();
            if (s instanceof SSAAbstractInvokeInstruction) {
                SSAAbstractInvokeInstruction call = (SSAAbstractInvokeInstruction) s;

                System.err.println(call.toString(table)); //DEBUG

                if (call.getCallSite().getDeclaredTarget().getName().toString().equals(methodName)) {
                    IntSet indices = ir.getCallInstructionIndices(call.getCallSite());
                    Assertions.productionAssertion(indices.size() == 1, "expected 1 but got " + indices.size());
                    return new NormalStatement(n, indices.intIterator().next());
                }
            }
        }
        Assertions.UNREACHABLE("failed to find call to " + methodName + " in " + n);
        return null;
    }


    //TODO return array??
    public static NormalStatement getFirstInvoke(CGNode node) {
        IR ir = node.getIR();
        for (SSAInstruction inst : ir.getInstructions()) {
            if (inst instanceof JavaScriptInvoke) {
                CallSiteReference callSite = ((JavaScriptInvoke) inst).getCallSite();

                System.err.println(callSite.getDeclaredTarget().toString());
                return new NormalStatement(node, ir.getCallInstructionIndices(callSite).intIterator().next());
            }
        }
        return null;
    }


    public void analyzeSDG() throws IOException {
        SDG<InstanceKey> sdg = sdg(Slicer.DataDependenceOptions.FULL, Slicer.ControlDependenceOptions.NONE);
        Statement source = null;
        for (Statement src : sdg) {
            //FIXME op het moment zie ik alleen dingen die buiten een functie gebeuren??
            if (src.getNode().getMethod().toString().contains("Lassignment")){
                if (src.toString().contains("getfield")) {
                    source = src;
                    for (Statement dst : sdg) {
                        if (src.equals(dst)) {
                            continue;
                        }
                        BFSPathFinder<Statement> paths = new BFSPathFinder<Statement>(sdg, source, dst);
                        List<Statement> shortPath = paths.find();
                        if (shortPath != null) {
                            System.err.println("~~~~~~~~~~~~~~~~~~~");
                            System.err.println(shortPath);
                            Print.printPath(shortPath);
                        }
                    }
                }
            }

        }

    }

}
