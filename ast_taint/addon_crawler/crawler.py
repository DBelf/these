import re
from selenium import webdriver
from selenium.webdriver.common.keys import Keys


driver = webdriver.Firefox()
driver.get("https://addons.mozilla.org/nl/firefox/extensions/?sort=users&page=2")
descriptionElementXPath = "//div[contains(@class, 'info')]";

assert "Add-ons" in driver.title

elems = driver.find_elements_by_xpath("//a[@href]")
addons_in_elems = filter(lambda elem: ".xpi" in elem.get_attribute("href"), elems)
for addon in addons_in_elems:
    print addon.get_attribute("href")
    
assert "No results found." not in driver.page_source
driver.close()
