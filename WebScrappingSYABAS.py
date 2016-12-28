import urllib.request as rq
import re
from bs4 import BeautifulSoup
import json
from  WebScrappingUtilWIBIS import save_to_DB

def process_content(soupObject, link):
    # article title
    def get_title():
        pagetitle = soupObject.find(class_='pagesubtitle')
        return pagetitle.string

    # article content
    def get_content():
        import re
        pagecontent = soupObject.find(class_='pagecontent')

        # Content
        formattedContent = pagecontent.prettify(formatter="html")
        content = re.sub(pattern=r'\n', repl='', string=formattedContent)
        return content

    item = dict()
    item['date'] = ''
    item['title'] = get_title()
    item['text'] = get_content()
    item['file_link'] = ''
    item['page_link'] = link

    return item

# Get Pages and open others
def get_pagelist(startLink):
    linkList = []
    currPage = 1
    lastPage = 2

    def get_max_page(soup):
        links = []
        pagination = soup.find(class_='paging')
        for page in pagination.children:
            if (page.string!=' | ' and page.a!=None):
                links.append(page.a.get('href')) # can pass this as parameter for scrapping

        lastpage = links[-1].split('/')
        lastpage = int(lastpage[3].split(':')[1])
        fulllinks = map(lambda x: 'http://www.syabas.com.my' + x, links)
        return { 'lastpage': lastpage, 'links': fulllinks }

    def eval_finished():
        # last page always return the previous page number
        return currPage > lastPage

    def append_link(newLinks):
        diff = set(newLinks).difference(set(linkList))
        linkList.extend(list(diff))

    # First page start here
    linkList.append(startLink);
    finished = False
    while not finished:
        scrappedPage = scrap_web(linkList[-1])
        maxObj = get_max_page(scrappedPage)
        currPage = lastPage
        lastPage = maxObj['lastpage']

        if not eval_finished():
            linkList.extend(maxObj['links'])

        finished = eval_finished()

    return linkList

def scrap_web(link):
    html = rq.urlopen(link).read()
    soup = BeautifulSoup(html, 'html.parser')
    return soup

def get_next_page(soup):
    pagination = soup.find(class_='paging')
    for page in pagination.children:
        if (page.string!=' | ' and page.a!=None):
            links.append(page.a.get('href')) # can pass this as parameter for scrapping
    return links[0]

# Credit to https://www.peterbe.com/plog/uniqifiers-benchmark
def uniqify(seq, idfun=None):
   #order preserving
   if idfun is None:
       def idfun(x): return x
   seen = {}
   result = []
   for item in seq:
       marker = idfun(item)
       if marker in seen: continue
       seen[marker] = 1
       result.append(item)
   return result

# Start here
urlSYABAS = 'http://www.syabas.com.my/nodes/index/page:1/type:press-release'
all_links = uniqify(get_pagelist(urlSYABAS))

# Now parse the website based on the list
contents = []
for link in all_links:
    web_extract = scrap_web(link)
    contents.append(process_content(web_extract, link))

# wrap to JSON
for content in contents:
    main = dict()
    main['category'] = 'SYABAS'
    main['cat_desc'] = 'Syarikat Bekalan Air Selangor'
    main['content'] = content
    jsonstr = json.dumps(main)

    # send content to Cache
    save_to_DB(jsonstr)
