import codecs, sys, json, time, datetime
from TwitterSearch import *
from twTOM import getprops
import intersys.pythonbind3

# Get configuration Id from command line
configId = sys.argv[1]
ns = sys.argv[2]

secrets = getprops("WIBIS.properties")
user = secrets['USERNAME']
password = secrets['PASSWORD']
host = secrets['HOST']
port = secrets['PORT']

try:
    # Connect to specified machine, in the SAMPLES namespace
    url = host + "["+port+"]:" + ns
    conn = intersys.pythonbind3.connection()
    conn.connect_now(url, user, password, None)
    database = intersys.pythonbind3.database(conn)

    # Get filter based on WebExtractor setting
    searchFilter = database.run_class_method("%BI.WebExtractor", "getFilter", [configId])

    tso = TwitterSearchOrder()
    tso.set_keywords(searchFilter)
    tso.set_language('en')
    tso.set_result_type('mixed')
    tso.set_count(100)

    ts = TwitterSearch(
            consumer_key = secrets['CONSUMER_KEY'],
            consumer_secret = secrets['CONSUMER_SECRET'],
            access_token = secrets['ACCESS_KEY'],
            access_token_secret = secrets['ACCESS_SECRET']
        )

    for tweet in ts.search_tweets_iterable(tso):
        twMsg = database.create_new("%BI.TweetMessage", None)
        twMsg.set("CreateDate", tweet['created_at'])
        twMsg.set("TweetText", tweet['text'])
        twMsg.set("Username", tweet['user']['screen_name'])
        twMsg.set("TweetID", tweet['id_str'])

        urls = tweet['entities']['urls']
        for url in urls:
            twMsg.run_obj_method("AddLink", url['expanded_url'])

        twMsg.run_obj_method("%Save",[])

# take care of all those ugly errors if there are some
except TwitterSearchException as e:
    print(e)

except intersys.pythonbind3.cache_exception as err:
    print ("InterSystems Cache' exception")
    print (sys.exc_type)
    print (sys.exc_value)
    print (sys.exc_traceback)
    print (str(err))
