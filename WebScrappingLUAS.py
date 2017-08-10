import urllib.request as rq
import re
from bs4 import BeautifulSoup
import json
from WebScrappingUtilWIBIS import save_to_DB

urlLUAS = 'http://www.luas.gov.my/v3/my/luas/arkib/pengumuman'
htmlLUAS = rq.urlopen(urlLUAS).read()
soup = BeautifulSoup(htmlLUAS, 'html.parser')


def get_announcement_rows(tag):
    return tag.name == 'tr' and tag.has_attr('class')


announcements = soup.find_all(get_announcement_rows)
links = []
for announcement in announcements:
    href = announcement.a.get('href')
    links.append(href)

fulllinks = map(lambda x: 'http://www.luas.gov.my' + x, links)

contents = []
for link in list(fulllinks):
    eachhtmlLUAS = rq.urlopen(link).read()
    soup = BeautifulSoup(eachhtmlLUAS, 'html.parser')

    # date
    rawdate = re.sub(pattern=r'\n+|\t+', repl='',
                     string=soup.find('time').string)
    date = re.sub(pattern=r'^\s+', repl='', string=rawdate.split(':')[1])

    # content
    rawContent = soup.find(class_='article-content-main')
    content = rawContent.span.string

    # title
    elements = soup.find(class_='article-title')
    title = re.sub(pattern=r'\n+|\t+', repl='',
                   string=list(elements.strings)[0])

    item = dict()
    item['date'] = date
    item['title'] = title
    item['text'] = content
    item['file_link'] = ''
    item['page_link'] = link
    contents.append(item)

# wrap to JSON
for content in contents:
    main = dict()
    main['category'] = 'LUAS'
    main['cat_desc'] = 'Lembaga Urus Air Selangor'
    main['content'] = content
    jsonstr = json.dumps(main)

    # send content to Cache
    save_to_DB(jsonstr)
