import itertools
import subprocess
import os
import re
import itertools

BASEPATH = '../addons/'

def parse_source(line1, line2):
    vulnerable_file = line1.split(',')[0].strip()
    vulnerable_addon = line1.split(',')[0].split('/')[2].strip()
    vulnerabilityType = line1.split(',')[1].strip()
    match = re.search('{"start":{"line":(?P<start>\d*),"column":\d*},"end":{"line":(?P<end>\d*),"column":\d*}};', line2)
    try:
        position = (int(match.group('start')), int(match.group('end')))
    except:
        'error'
        return
    with open(vulnerable_file, "r") as text_file:
        with open('vulnerabilities/{}.txt'.format(vulnerable_addon), 'a') as new_file:
            new_file.write("{}::source::\n".format(vulnerable_file))
            for line in itertools.islice(text_file, position[0] - 1, position[1]):
                new_file.write('{}\n'.format(line.strip()))

def parse_sink(line1, line2):
    vulnerable_file = line1.split(',')[0].strip()
    vulnerable_addon = line1.split(',')[0].split('/')[2].strip()
    match = re.search('{"start":{"line":(?P<start>\d*),"column":\d*},"end":{"line":(?P<end>\d*),"column":\d*}};', line2)
    try:
        position = (int(match.group('start')), int(match.group('end')))
    except:
        print 'error'
        return
    with open(vulnerable_file, "r") as text_file:
        with open('vulnerabilities/{}.txt'.format(vulnerable_addon), 'a') as new_file:
            new_file.write("{}::sink::\n".format(vulnerable_file))
            for line in itertools.islice(text_file, position[0] - 1, position[1]):
                new_file.write('{}\n'.format(line.strip()))


for folder in os.walk(BASEPATH).next()[1]:
    subprocess.call('node ../lib/ASTTaint.js {0}'.format(BASEPATH + folder), shell=True)
#
# with open('vulnerabilities/sources.txt') as f:
#     for line1,line2 in itertools.izip_longest(*[f]*2):
#         parse_source(line1,line2)
#
# with open('vulnerabilities/sinks.txt') as f:
#     for line1,line2 in itertools.izip_longest(*[f]*2):
#         parse_sink(line1,line2)
