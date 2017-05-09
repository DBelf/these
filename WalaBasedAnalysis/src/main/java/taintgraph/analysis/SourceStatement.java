import com.ibm.wala.ipa.slicer.NormalStatement;
import com.ibm.wala.ipa.slicer.Statement;
import com.ibm.wala.ipa.slicer.Statement.Kind;
import com.ibm.wala.shrikeCT.InvalidClassFileException;
import com.ibm.wala.ssa.SSAGetInstruction;
import com.ibm.wala.ssa.SSAInstruction;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;

/**
 *
 */
public class SourceStatement implements CriticalStatement {

    Set<String> sourceOperations;

    public SourceStatement() {
        initializeSourceSet();

    }

    //TODO clean this up?
    private void initializeSourceSet(){
        sourceOperations = new HashSet<String>() {{
            add("URL");
            add("value");
            add("href");
            add("documentURI");
            add("cookie");
            add("URLUnencoded");
            add("baseURI");
            add("referrer");
            add("global location");
            add("hash");
            add("data");
            add("search");
        }};
    }

    @Override
    public boolean isCritical(Statement s) {
        switch (s.getKind()){
            case NORMAL:
                try {
                    return isSource((NormalStatement) s);
                } catch (InvalidClassFileException e) {
                    e.printStackTrace();
                }
            default:
                return false;
        }
    }

    private boolean isSource(Statement s) {
        return false;
    }

    private boolean isSource(NormalStatement ns) throws InvalidClassFileException {
        SSAInstruction inst = ns.getInstruction();
        if (inst instanceof SSAGetInstruction) {
            String fieldName = ((SSAGetInstruction) inst).getDeclaredField().getName().toString();

            if (sourceOperations.contains(fieldName)) {
                System.err.println(ns.getNode().getMethod().getSourcePosition(ns.getInstructionIndex()));
                return true;
            }
        }
        return false;
    }

}
