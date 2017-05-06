/**
 *
 */
public class FileInfo {
    private String rootPath;
    private String fileName;

    public FileInfo(String rootPath, String fileName) {
        this.rootPath = rootPath;
        this.fileName = fileName;
    }

    public String getRoot() {
        return rootPath;
    }

    public String getName() {
        return fileName;
    }

    public String getSourceMethod() {
        return fileName.split(".js")[0];
    }
}


