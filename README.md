# thesis

## Static Analysis of Firefox WebExtensions

This repository contains the source code for a static analysis tool for WebExtensions written in JavaScript.  The tool is part of my master thesis on the detection of privilege escalation vulnerabilities in WebExtensions.
The analysis tool is able to detect inter process communication vulnerabilities by analyzing the AST of the source code of each script in the extension.

## Using the tool
The analysis tool is written in JavaScript and can be run with `node.js`. However, to fully use it, the provided `python` scripts in the `addon_crawler` folder have to be used. 

Usage of the scripts:

---

To download the extensions from any of the top downloaded [pages](https://addons.mozilla.org/nl/firefox/extensions/?sort=users). The `crawler.py` script can be used. This will download the page provided as an argument.
For example, the following script will download the first page:
```
> python crawler.py 1
```

---
To run the analysis on the downloaded extensions, first `node.js` has to install the required modules, this is done by running the following command:
```
> npm install
```

After this is done, the `filereader.py` script can be used to execute the analysis on the downloaded extensions and write the output to text files.
```
> python filereader.py
```

The output of the analysis can now be found in the vulnerabilities folder. Each extension has its own text file with the detected vulnerabilities and their context in the source code. To verify whether the vulnerabilities are true positives, a manual check has to be done. 
