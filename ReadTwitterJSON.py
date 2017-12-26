#!usr/bin/python
import sys
import json
import intersys.pythonbind3
from twTOM import getprops

filePath = sys.argv[1]

secrets = getprops("WIBIS.properties")
user = secrets['USERNAME']
password = secrets['PASSWORD']
host = secrets['HOST']
port = secrets['PORT']
ns = "SMSWIBIS"

try:
    # Connect to specified machine, in the SAMPLES namespace
    url = host + "["+port+"]:" + ns
    conn = intersys.pythonbind3.connection()
    conn.connect_now(url, user, password, None)
    database = intersys.pythonbind3.database(conn)

    # Read the file
    with open(filePath, encoding='utf-8') as data_file:
        data=json.loads(data_file.read())

    # Load the data to the database
    for item in data:
        for tweet in data[item]:
            twMsg = database.create_new("%BI.TweetMessage", None)
            twMsg.set("DateCreated", tweet['date'])
            twMsg.set("TweetMessage",tweet['text'])
            twMsg.set("TweetID",tweet['id'])

            twMsg.run_obj_method("%Save",[])

except intersys.pythonbind3.cache_exception as err:
    print ("InterSystems Cache' exception")
    print (sys.exc_type)
    print (sys.exc_value)
    print (sys.exc_traceback)
    print (str(err))