#!/usr/bin/python
import codecs, sys, json, time, os
from twTOM import getprops
import intersys.pythonbind3

def save_to_DB(jsonString):
    secrets = getprops(r'c:\intersystems\cache\csp\sys\bi\python\WIBIS.properties')
    user = secrets['USERNAME'];
    password = secrets['PASSWORD'];
    host = secrets['HOST'];
    port = secrets['PORT'];

    try:
        url = host+"["+port+"]:SMSWIBIS"
        conn = intersys.pythonbind3.connection()
        conn.connect_now(url, user, password, None)
        database = intersys.pythonbind3.database(conn)

        sc = database.run_class_method('%BI.WebScrappingArticles','Insert',[jsonString])

    except intersys.pythonbind3.cache_exception as err:
        print ("InterSystems Cache' exception")
        print (sys.exc_type)
        print (sys.exc_value)
        print (sys.exc_traceback)
        print (str(err))
