import itertools

import subprocess

subprocess.call('node ../lib/ASTTaint.js ../addons/fireftp', shell=True)
#
# with open() as f:
#     for line1,line2 in itertools.izip_longest(*[f]*2):
#         print(line1,line2)
