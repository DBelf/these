from itertools import izip_longest

totalRead = 0;
webextensions = 0
editedCSP = 0
unsafeOperations = 0

def grouper(iterable, n, fillvalue=None):
    "grouper(3, 'ABCDEFG', 'x') --> ABC DEF Gxx"
    args = [iter(iterable)] * n
    return izip_longest(*args, fillvalue=fillvalue)

def unpackLines(lines):
    global totalRead
    global webextensions
    global editedCSP
    global unsafeOperations
    totalRead  += 1
    if ( 'Found' in lines[1]):
        webextensions += 1
    if ('edited' in lines[2]):
        editedCSP += 1
    if('unsafe' in lines[2]):
        unsafeOperations += 1
    return lines[1]

def calculatePercentage(part, whole):
    return 100 * float(part)/float(whole)

with open('../fileCrawler.txt', "r") as text_file:
    for lines in grouper(text_file, 4, ""):
        print unpackLines(lines)

print 'Total number of extensions checked: {}'.format(totalRead)
# print webextensions
# print editedCSP
# print unsafeOperations
print 'Amount and Percentage WebExtensions: {0} - {1:.2f}%'.format(webextensions, calculatePercentage(webextensions, totalRead))
print 'Amount and Percentage edited CSPs: {0} - {1:.2f}%'.format(editedCSP, calculatePercentage(editedCSP, webextensions))
print 'Amount and Percentage unsafe operations allowed: {0} - {1:.2f}%'.format(unsafeOperations, calculatePercentage(unsafeOperations, webextensions))
