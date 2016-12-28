import urllib.request as rq
import re
from bs4 import BeautifulSoup
import json
from WebScrappingUtilWIBIS import save_to_DB

# article content
def get_content(soupObject):
    formattedContent = soupObject.prettify(formatter="html")
    return re.sub(pattern=r'\n', repl='', string=formattedContent)

urlSADA = 'http://www.sada.com.my/sada/index.php?r=column/announcement&cat=46&id=46'
htmlSADA = rq.urlopen(urlSADA).read()
soup = BeautifulSoup(htmlSADA, 'html.parser')
foundContent = soup.find(id="div_print")
title = foundContent.find('h3').string

# build one content
content_str = get_content(foundContent)
contents = []
item = dict()
item['text'] = content_str
item['date'] = ''
item['file_link'] = ''
item['title'] = title
item['page_link'] = urlSADA
contents.append(item)

for content in contents:
    # wrap to JSON
    main = dict()
    main['category'] = 'SADA'
    main['cat_desc'] = 'Syarikat Air Darul Aman'
    main['content'] = content
    jsonstr = json.dumps(main)

    # send content to Cache
    save_to_DB(jsonstr)
