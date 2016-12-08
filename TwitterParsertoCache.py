# This is to read from twitter feed
import codecs, sys
from tweepy import Stream
import twTOM
from tweepy.streaming import StreamListener
import json
import intersys.pythonbind3
import time

secrets = getprops("WIBIS.properties")
user = secrets['USERNAME'];
password = secrets['PASSWORD'];
host = secrets['HOST'];
port = secrets['PORT'];
query = "";
twID = 18396
MSG = ""

try:
    class listener(StreamListener):

        def on_data(self, data):
            global twID
            global MSG
            d = json.loads(data)
            tText = d.get("text")
            #lText = tText.lower()
            #if (MSG != tText) & (Filter1 in lText) & ((Filter2 in lText) | (Filter2 == "")):
            twMsg =  database.create_new("tweet.message", None)
            twID = twID + 1
            twMsg.set("TweetID",str(twID));
            twMsg.set("CreateDate",d.get("created_at"));
            twMsg.set("TweetText",d.get("text"));
            twMsg.set("Filter","development");
            twMsg.run_obj_method("%Save",[])
            print ("******" + str(twID) + tText)
            return True

        def on_error(self, status):
            print (status)

    # Connect to specified machine, in the SAMPLES namespace
    url = host+"["+port+"]:DESABI"
    conn = intersys.pythonbind3.connection( )
    conn.connect_now(url, user, password, None)
    database = intersys.pythonbind3.database( conn)
    auth = twTOM.Authenticate()
    twitterStream = Stream(auth, listener())
    twitterStream.filter(track=["national income","economic depression"])

except intersys.pythonbind3.cache_exception ( err ):
    print ("InterSystems Cache' exception")
    print (sys.exc_type)
    print (sys.exc_value)
    print (sys.exc_traceback)
    print (str(err))
