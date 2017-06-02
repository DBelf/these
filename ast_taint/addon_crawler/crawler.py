import urllib
from selenium import webdriver
from selenium.webdriver.common.keys import Keys

global DEFAULT_PATH = '../addons/'

def download_url(addon_element):
    filename = 'tmp';
    urllib.urlretrieve(addon_element.get_attribute("href"), filename)

driver = webdriver.Firefox()
driver.get("https://addons.mozilla.org/nl/firefox/extensions/?sort=users&page=2")
descriptionElementXPath = "//div[contains(@class, 'info')]";

assert "Add-ons" in driver.title

elems = driver.find_elements_by_xpath("//a[@href]")

addons_in_elems = filter(lambda elem: ".xpi" in elem.get_attribute("href"), elems)

for addon_url in addons_in_elems:
    download_url(addon_url)
    break;

assert "No results found." not in driver.page_source
driver.close()
