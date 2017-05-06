import com.ibm.wala.ipa.slicer.Statement;

/**
 *
 */
public interface CriticalStatement {

    boolean isCritical(Statement s);
}
