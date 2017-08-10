import scrapy
from scrapy.crawler import CrawlerProcess
from scrapy.spiders import BaseSpider
from scrapy.selector import HtmlXPathSelector
from scrapy.http import FormRequest, Request
from scrapy.linkextractors import LinkExtractor
from scrapy.utils.response import open_in_browser
import re
import json
from WebScrappingUtilWIBIS import save_to_DB


class SainsSpider(scrapy.Spider):
    name = "sains"
    start_urls = ["http://www.sainswater.com/index.php/ms-MY/berita-terkini"]

    def parse(self, response):
        yield FormRequest.from_response(response,
                                        formname='adminForm',
                                        formdata={
                                            'limit': '0', 'filter_order': '', 'filter_order_Dir': '', 'limitstart': '', 'task': ''},
                                        callback=self.parse_Page)

    def parse_Page(self, response):
        # open_in_browser(response)
        rows = response.xpath(
            "//form[@id='adminForm']/table/tbody/tr[*]/td[1]/a[@href]")
        for row in rows:
            url = 'http://www.sainswater.com' + \
                row.xpath("@href").extract_first()
            yield scrapy.Request(url=url, callback=self.parse_full_article)

    def parse_full_article(self, response):
        # open the path and scrap
        text = ""
        content = response.xpath("//article/div/p")
        for subcontent in content:
            textincontent = subcontent.xpath("text()").extract()
            if (len(textincontent) > 0):
                text = text + textincontent[0]
        title = re.sub(pattern=r'\n+|\t+', repl='',
                       string=response.xpath("//article/h1/text()").extract_first())

        item = dict()
        item['title'] = title
        item['text'] = text
        item['page_link'] = response.url
        item['file_link'] = ''
        item['date'] = ''

        main = dict()
        main['category'] = 'SAINS'
        main['cat_desc'] = 'Syarikat Air Negeri Sembilan'
        main['content'] = item
        jsonstr = json.dumps(main)
        # print(jsonstr)

        # send content to Cache
        save_to_DB(jsonstr)


class SainsMakluman(scrapy.Spider):
    name = "makluman"
    start_urls = [
        'http://www.sainswater.com/index.php/ms-MY/2-uncategorised/76-maklumat-bekalan-air?tmpl=component']

    def parse(self, response):
        def createItem(date, text, url, ctr):
            item = dict()
            item['title'] = 'Maklumat Gangguan Bekalan Air (' + str(
                ctr) + ') ' + date
            item['text'] = text
            item['page_link'] = response.url
            item['file_link'] = ''
            item['date'] = date
            return item

        trs = response.xpath("//table/tr[*]")
        url = response.url
        ctr = 0
        for tr in trs:
            isDateExist = tr.xpath(
                "td[*]/strong/text()").extract_first() is not None
            isTextExist = tr.xpath("td[*]/p").extract_first() is not None
            if isDateExist is True and isTextExist is True:
                ctr = ctr + 1
                date = tr.xpath("td[*]/strong/text()").extract_first()
                text = tr.xpath("td[*]/p").extract_first()
                thisItem = createItem(date=date, text=text, url=url, ctr=ctr)

                main = dict()
                main['category'] = 'SAINS'
                main['cat_desc'] = 'Syarikat Air Negeri Sembilan'
                main['content'] = thisItem
                jsonstr = json.dumps(main)
                # print(jsonstr)

                # send content to Cache
                save_to_DB(jsonstr)


process = CrawlerProcess({
    'USER_AGENT': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1)'
})
process.crawl(crawler_or_spidercls=SainsSpider)
process.crawl(crawler_or_spidercls=SainsMakluman)
process.start()
