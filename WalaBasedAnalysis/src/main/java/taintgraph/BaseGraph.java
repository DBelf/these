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
    private SDG<InstanceKey> sdg;

    public BaseGraph(FileInfo file) throws IOException, WalaException, CancelException {
        this.file = file;

        JSCallGraphUtil.setTranslatorFactory(new CAstRhinoTranslatorFactory());

        cgb = JSCallGraphBuilderUtil.makeScriptCGBuilder(file.getRoot(), file.getName());
        cg = cgb.makeCallGraph(cgb.getOptions());
        sdg = sdg(Slicer.DataDependenceOptions.FULL, Slicer.ControlDependenceOptions.NONE);
    }

    private SDG<InstanceKey> sdg(Slicer.DataDependenceOptions data, Slicer.ControlDependenceOptions control) {
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

    public CGNode getScriptEntry() {
        Atom funAtom = Atom.findOrCreateUnicodeAtom("do");
        String decClassName = "L" + file.getName();

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
        Assertions.UNREACHABLE("failed to find entry method of " + decClassName);
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


    public void printSDG(){
        SDG<InstanceKey> sdg = sdg(Slicer.DataDependenceOptions.FULL, Slicer.ControlDependenceOptions.NONE);
        for (Statement statement : sdg) {
            if (statement.getNode().getMethod().toString().contains(file.getName())) {
                if (statement.getKind() == Statement.Kind.NORMAL) {
                    NormalStatement ns = (NormalStatement) statement;
                    SSAInstruction inst = ns.getInstruction();
                    System.err.print(inst.getClass() + "  +  ");
                    if(inst instanceof SSAGetInstruction) {
                        System.err.println("Getinst:" + ((SSAGetInstruction) inst).getDeclaredField().getName());
                    } else if (inst instanceof JavaScriptInvoke) { //Dit wordt gemaakt als je een method invoked uit een object.
                        System.err.println("Invokeinst: " + ((JavaScriptInvoke) inst).getFunction());
                    } else {
                        System.err.println("Anything: " + inst);
                    }
                }
                System.err.println();
            }
        }
    }

    public void analyze() {
        SDG<InstanceKey> sdg = sdg(Slicer.DataDependenceOptions.FULL, Slicer.ControlDependenceOptions.NONE);
        SourceStatement sourceCheck = new SourceStatement();
        for (Statement statement : sdg) {
            if (sourceCheck.isCritical(statement)) {
                System.err.println(statement);
            }
        }

    }

    //TODO fix
    public void oldAnalyzeSDG() throws IOException {
        SDG<InstanceKey> sdg = sdg(Slicer.DataDependenceOptions.FULL, Slicer.ControlDependenceOptions.NONE);
        Statement source = null;
        for (Statement src : sdg) {
            //FIXME op het moment zie ik alleen dingen die buiten een functie gebeuren??

            if (src.getNode().getMethod().toString().contains(file.getName())){
                if (src.getKind() == Statement.Kind.NORMAL) {
                    NormalStatement ns = (NormalStatement) src;
                    SSAInstruction inst = ns.getInstruction();
                    if (inst instanceof SSAGetInstruction) {
                        if (((SSAGetInstruction) inst).getDeclaredField().getName().toString().contains("value")){
                            source = src;
                            for (Statement dst : sdg) {
                                if (src.equals(dst)) {
                                    continue;
                                }
                                BFSPathFinder<Statement> paths = new BFSPathFinder<Statement>(sdg, source, dst);
                                List<Statement> shortPath = paths.find();
                                if (shortPath != null) {
                                    System.err.println("~~~~~~~~~~~~~~~~~~~");
                                    //System.err.println(shortPath);
                                    Print.printPath(shortPath);
                                }
                            }
                        }
                    }

                }
            }

        }

    }

    public SDG<InstanceKey> getSDG() {
        return sdg;
    }
}
