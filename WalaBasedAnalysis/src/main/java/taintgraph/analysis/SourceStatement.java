import com.ibm.wala.ipa.slicer.NormalStatement;
import com.ibm.wala.ipa.slicer.Statement;
import com.ibm.wala.ipa.slicer.Statement.Kind;
import com.ibm.wala.ssa.SSAGetInstruction;
import com.ibm.wala.ssa.SSAInstruction;

import java.util.ArrayList;

/**
 *
 */
public class SourceStatement implements CriticalStatement {

    ArrayList<String> sourceOperations = new ArrayList<String>();

    //TODO clean this up
    public SourceStatement() {
        sourceOperations.add("URL");
        sourceOperations.add("value");
        sourceOperations.add("href");
        sourceOperations.add("documentURI");
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
            if (sourceOperations.contains(fieldName)) {
                return true;
            }
        }
        return false;
    }

}
