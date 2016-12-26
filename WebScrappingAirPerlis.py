import urllib.request as rq
import re
from bs4 import BeautifulSoup

urlSAP = 'http://www.airperlis.com.my/index.php/en/'
htmlSAP = rq.urlopen(urlSAP).read()
soup = BeautifulSoup(htmlSAP, 'html.parser')
articles = soup.find_all('article')

# article content
def get_content(soupObject):
    formattedContent = soupObject.prettify(formatter="html")
    return re.sub(pattern=r'\n', repl='', string=formattedContent)

content = get_content(articles[0])
