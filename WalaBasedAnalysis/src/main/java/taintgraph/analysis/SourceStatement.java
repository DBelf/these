import com.ibm.wala.ipa.slicer.NormalStatement;
import com.ibm.wala.ipa.slicer.Statement;
import com.ibm.wala.ipa.slicer.Statement.Kind;
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

    //TODO clean this up
    public SourceStatement() {
        initializeSourceSet();

    }

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
        }};
    }

    @Override
    public boolean isCritical(Statement s) {
        switch (s.getKind()){
            case NORMAL:
                return isSource((NormalStatement) s);
            default:
                return false;
        }
    }

    private boolean isSource(Statement s) {
        return false;
    }

    private boolean isSource(NormalStatement ns){
        SSAInstruction inst = ns.getInstruction();
        if (inst instanceof SSAGetInstruction) {
            String fieldName = ((SSAGetInstruction) inst).getDeclaredField().getName().toString();
//            System.err.println(fieldName);
            if (sourceOperations.contains(fieldName)) {
                return true;
            }
        }
        return false;
    }

}
