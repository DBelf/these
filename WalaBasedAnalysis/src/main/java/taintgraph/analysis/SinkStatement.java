import com.ibm.wala.ipa.slicer.Statement;

/**
 *
 */
public class SinkStatement implements CriticalStatement {


    private boolean isSink(Statement s) {
        return false;
    }

    @Override
    public boolean isCritical(Statement s) {
        return isSink(s);
    }


}
