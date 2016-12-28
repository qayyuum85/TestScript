import urllib.request as rq
import re, bs4
from bs4 import BeautifulSoup
import json
from  WebScrappingUtilWIBIS import save_to_DB

def has_media_info(tag):
    return tag.name=='tr'

urlPBABPP = 'http://www.pba.com.my/?page_id=845'
html = rq.urlopen(urlPBABPP).read()
soup = BeautifulSoup(html, 'html.parser')

# custom-tab-1 refers to the media release tab
mediaRelease = soup.find(id='custom-tab-1')

# get all rows in the table
trs = mediaRelease.find_all(has_media_info)

contents = []
for tr in trs:
    if (len(tr.contents)>3):
        item = dict()
        for td in tr.children:
            if (td!='\n'):
                if (type(td.contents[0]) == bs4.element.NavigableString):
                    item['date'] = td.contents[0].string
                elif (type(td.contents[0]) == bs4.element.Tag):
                    item['title'] = td.a.string
                    item['file_link'] = td.a.get('href')
                item['text'] = ''
                item['page_link'] = ''

        contents.append(item)

# wrap to JSON
for content in contents:
    main = dict()
    main['category'] = 'PBAPP'
    main['cat_desc'] = 'Perbadanan Bekalan Air Pulau Pinang'
    main['content'] = content
    jsonstr = json.dumps(main)

    # send content to Cache
    save_to_DB(jsonstr)
