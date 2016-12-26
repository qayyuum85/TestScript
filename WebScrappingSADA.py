import urllib.request as rq
import re
from bs4 import BeautifulSoup

urlSADA = 'http://www.sada.com.my/sada/index.php?r=column/announcement&cat=46&id=46'
htmlSADA = rq.urlopen(urlSADA).read()
soup = BeautifulSoup(htmlSADA, 'html.parser')

content = soup.find(id="div_print")

# article content
def get_content(soupObject):
    formattedContent = soupObject.prettify(formatter="html")
    return re.sub(pattern=r'\n', repl='', string=formattedContent)

content_str = get_content(content)
