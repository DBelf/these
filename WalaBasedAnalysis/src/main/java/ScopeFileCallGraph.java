import com.ibm.wala.cast.js.ipa.callgraph.JSAnalysisOptions;
import com.ibm.wala.cast.js.ipa.callgraph.JSCFABuilder;
import com.ibm.wala.cast.js.ipa.callgraph.JSCallGraphUtil;
import com.ibm.wala.cast.js.ipa.callgraph.JSZeroOrOneXCFABuilder;
import com.ibm.wala.classLoader.IClass;
import com.ibm.wala.classLoader.IMethod;
import com.ibm.wala.ipa.callgraph.*;
import com.ibm.wala.ipa.callgraph.impl.DefaultEntrypoint;
import com.ibm.wala.ipa.callgraph.impl.Util;
import com.ibm.wala.ipa.callgraph.propagation.cfa.ZeroXInstanceKeys;
import com.ibm.wala.ipa.cha.ClassHierarchyException;
import com.ibm.wala.ipa.cha.ClassHierarchyFactory;
import com.ibm.wala.ipa.cha.IClassHierarchy;
import com.ibm.wala.types.ClassLoaderReference;
import com.ibm.wala.types.TypeReference;
import com.ibm.wala.util.config.AnalysisScopeReader;
import com.ibm.wala.util.io.CommandLine;
import com.ibm.wala.util.strings.StringStuff;
import com.ibm.wala.util.warnings.Warnings;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Properties;

/**
 *
 */
public class ScopeFileCallGraph {


    public static void main(String[] args) throws IOException, ClassHierarchyException, IllegalArgumentException,
            CallGraphBuilderCancelException {
            long start = System.currentTimeMillis();
            Properties p = CommandLine.parse(args);
            String scopeFile = p.getProperty("scopeFile");
            String entryClass = p.getProperty("entryClass");
            String mainClass = p.getProperty("mainClass");
            if (mainClass != null && entryClass != null) {
                throw new IllegalArgumentException("only specify one of mainClass or entryClass");
            }
            // use exclusions to eliminate certain library packages
            File exclusionsFile = null;
            AnalysisScope scope = AnalysisScopeReader.readJavaScope(scopeFile, exclusionsFile, ScopeFileCallGraph.class.getClassLoader());
            IClassHierarchy cha = ClassHierarchyFactory.make(scope, loaders, );
            System.out.println(cha.getNumberOfClasses() + " classes");
            System.out.println(Warnings.asString());
            Warnings.clear();
            JSAnalysisOptions options = ;
            Iterable<Entrypoint> entrypoints = entryClass != null ? makePublicEntrypoints(scope, cha, entryClass) : Util.makeMainEntrypoints(scope, cha, mainClass);
            options.setEntrypoints(entrypoints);
            // you can dial down reflection handling if you like
//    options.setReflectionOptions(ReflectionOptions.NONE);
            AnalysisCache cache = new AnalysisCacheImpl();
            // other builders can be constructed with different Util methods

        JSCFABuilder builder = new JSZeroOrOneXCFABuilder(cha, options, cache, null, null, ZeroXInstanceKeys.ALLOCATIONS, true);
//    CallGraphBuilder builder = Util.makeNCFABuilder(2, options, cache, cha, scope);
//    CallGraphBuilder builder = Util.makeVanillaNCFABuilder(2, options, cache, cha, scope);
            System.out.println("building call graph...");
            CallGraph cg = builder.makeCallGraph(options, null);
            long end = System.currentTimeMillis();
            System.out.println("done");
            System.out.println("took " + (end-start) + "ms");
            System.out.println(CallGraphStats.getStats(cg));
        }

        private static Iterable<Entrypoint> makePublicEntrypoints(AnalysisScope scope, IClassHierarchy cha, String entryClass) {
            Collection<Entrypoint> result = new ArrayList<Entrypoint>();
            IClass klass = cha.lookupClass(TypeReference.findOrCreate(ClassLoaderReference.Application,
                    StringStuff.deployment2CanonicalTypeString(entryClass)));
            for (IMethod m : klass.getDeclaredMethods()) {
                if (m.isPublic()) {
                    result.add(new DefaultEntrypoint(m, cha));
                }
            }
            return result;
        }
}
