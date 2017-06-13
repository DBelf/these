import itertools
import subprocess
import os

BASEPATH = '../addons/'

for folder in os.walk(BASEPATH).next()[1]:
    subprocess.call('node ../lib/ASTTaint.js {0}'.format(BASEPATH + folder), shell=True)


#
# with open() as f:
#     for line1,line2 in itertools.izip_longest(*[f]*2):
#         print(line1,line2)
