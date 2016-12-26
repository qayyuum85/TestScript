import urllib.request as rq
import re
import bs4
from bs4 import BeautifulSoup

def has_media_info(tag):
    return tag.name=='tr'

url = 'http://www.pba.com.my/?page_id=845'
html = rq.urlopen(url).read()
soup = BeautifulSoup(html, 'html.parser')

# custom-tab-1 refers to the media release tab
mediaRelease = soup.find(id='custom-tab-1')

# get all rows in the table
trs = mediaRelease.find_all(has_media_info)

all_content = []
for tr in trs:
    if (len(tr.contents)>3):
        item = dict()
        for td in tr.children:
            if (td!='\n'):
                if (type(td.contents[0]) == bs4.element.NavigableString):
                    item['date'] = td.contents[0].string
                elif (type(td.contents[0]) == bs4.element.Tag):
                    item['title'] = td.a.string
                    item['link'] = td.a.get('href')

        all_content.append(item)
