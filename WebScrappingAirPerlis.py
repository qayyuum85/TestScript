import urllib.request as rq
import re
from bs4 import BeautifulSoup
import json
from  WebScrappingUtilWIBIS import save_to_DB

urlSAP = 'http://www.airperlis.com.my/index.php/en/'
htmlSAP = rq.urlopen(urlSAP).read()
soup = BeautifulSoup(htmlSAP, 'html.parser')
articles = soup.find_all('article')
title = articles[0].find('li').string

# article content
def get_content(soupObject):
    formattedContent = soupObject.prettify(formatter="html")
    return re.sub(pattern=r'\n', repl='', string=formattedContent)

contents = []
item = dict()
item['date'] = ''
item['title'] = title
item['text'] = get_content(articles[0])
item['file_link'] = ''
item['page_link'] = urlSAP
contents.append(item)

# wrap to JSON
for content in contents:
    main = dict()
    main['category'] = 'SAP'
    main['cat_desc'] = 'Syarikat Air Perlis'
    main['content'] = content
    jsonstr = json.dumps(main)

    # send content to Cache
    save_to_DB(jsonstr)
