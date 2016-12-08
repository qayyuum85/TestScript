#!/usr/bin/python
import sys
import feedparser #rss parser
import intersys.pythonbind3
from time import gmtime, strftime, localtime
from twTOM import getprops

def saveToDB(parsedObj):
    secrets = getprops("WIBIS.properties")
    user = secrets['USERNAME'];
    password = secrets['PASSWORD'];
    host = secrets['HOST'];
    port = secrets['PORT'];

    try:
        url = host+"["+port+"]:QAYYUUM"
        conn = intersys.pythonbind3.connection()
        conn.connect_now(url, user, password, None)
        database = intersys.pythonbind3.database(conn)

        if (len(parsedObj.entries)!=0):
            entries = parsedObj.entries
            for entry in entries:
                eDate = strftime('%d/%m/%Y', entry['published_parsed'])
                eTime = strftime('%H:%M:%S', entry['published_parsed'])
                database.run_class_method('RSS.Listing','Fetch',[entry.title, entry.summary, entry.link, eDate, eTime])

    except intersys.pythonbind3.cache_exception ( err ):
        print ("InterSystems Cache' exception")
        print (sys.exc_type)
        print (sys.exc_value)
        print (sys.exc_traceback)
        print (str(err))

def parseRSS(link):
    d = feedparser.parse(link)
    return d

link = sys.argv[1]

rssObj = parseRSS(link)
saveToDB(rssObj)
