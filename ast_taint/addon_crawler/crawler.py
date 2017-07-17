import urllib
import re
import zipfile
import os
from selenium import webdriver
from selenium.webdriver.common.keys import Keys

DEFAULT_PATH = '../addons/'

def download_url(addon_element):
    url = addon_element.get_attribute("href")
    file_path = path_from_url(url)
    urllib.urlretrieve(addon_element.get_attribute("href"), file_path)
    unzip(file_path)

def path_from_url(url):
    filename = re.search(".*/downloads/latest/([\w | -]*).*", url).group(1);
    file_path = DEFAULT_PATH + filename + '.zip'
    return file_path

def unzip(path):
    zip_ref = zipfile.ZipFile(path, 'r')
    zip_ref.extractall(path.split('.zip')[0])
    zip_ref.close()
    os.remove(path)

for i in range(1, 21):
    driver = webdriver.Firefox()
    driver.get("https://addons.mozilla.org/nl/firefox/extensions/?sort=users&page={}").format(i)
    descriptionElementXPath = "//div[contains(@class, 'info')]";

    assert "Add-ons" in driver.title

    elems = driver.find_elements_by_xpath("//a[@href]")

    addons_in_elems = filter(lambda elem: ".xpi" in elem.get_attribute("href"), elems)

    for addon_url in addons_in_elems:
        download_url(addon_url)

    assert "No results found." not in driver.page_source
    driver.close()
