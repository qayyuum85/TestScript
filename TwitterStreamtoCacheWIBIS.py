import codecs, sys, json, time
from tweepy import Stream
from tweepy.streaming import StreamListener
from twTOM import getprops
import twTOM
import intersys.pythonbind3

# Get configuration Id from command line
configId = sys.argv[1]
ns = sys.argv[2]

secrets = getprops("WIBIS.properties")
user = secrets['USERNAME'];
password = secrets['PASSWORD'];
host = secrets['HOST'];
port = secrets['PORT'];

try:
    class listener(StreamListener):
        def on_data(self, data):
            d = json.loads(data)

            twMsg = database.create_new("%BI.TweetMessage", None)
            twMsg.set("CreateDate", d['created_at'])
            twMsg.set("TweetText", d['text'])
            twMsg.set("Username", d['user']['screen_name'])
            twMsg.set("TweetID", d['id_str'])

            urls = d['entities']['urls']
            for url in urls:
                twMsg.run_obj_method("AddLink", url['expanded_url'])

            twMsg.run_obj_method("%Save",[])
            return True

        def on_error(self, status):
            print (status)

    # Connect to specified machine, in the SAMPLES namespace
    url = host + "["+port+"]:" + ns
    conn = intersys.pythonbind3.connection()
    conn.connect_now(url, user, password, None)
    database = intersys.pythonbind3.database(conn)

    # Get filter based on WebExtractor setting
    trackFilter = database.run_class_method("%BI.WebExtractor", "getFilter", [configId])
    # Get authentication from file
    auth = twTOM.Authenticate()
    twitterStream = Stream(auth, listener())
    twitterStream.filter(track=trackFilter, language="en")

except intersys.pythonbind3.cache_exception as err:
    print ("InterSystems Cache' exception")
    print (sys.exc_type)
    print (sys.exc_value)
    print (sys.exc_traceback)
    print (str(err))
