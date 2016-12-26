import urllib.request as rq
import re
from bs4 import BeautifulSoup

def process_content(soupObject):
    # article title
    def get_title():
        pagetitle = soupObject.find(class_='pagesubtitle')
        return pagetitle.string

    # article content
    def get_content():
        import re
        pagecontent = soupObject.find(class_='pagecontent')
        formattedContent = pagecontent.prettify(formatter="html")
        return re.sub(pattern=r'\n', repl='', string=formattedContent)

    title = get_title()
    content = get_content()

    return {'title': title, 'content': content}

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
        print(lastPage)

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
all_content = []
for link in all_links:
    extract = scrap_web(link)
    all_content.append(process_content(extract))
