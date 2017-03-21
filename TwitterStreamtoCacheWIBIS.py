#!/usr/bin/python
import codecs, sys, json, time, os
import tweepy
from tweepy import Stream
from tweepy.streaming import StreamListener
import twTOM
import intersys.pythonbind3

# Get configuration Id from command line
# Please hardcode this value in case you are running from the notebook
configId = 2
secrets = getprops("WIBIS.properties")
user = secrets['USERNAME'];
password = secrets['PASSWORD'];
host = secrets['HOST'];
port = secrets['PORT'];

try:
    class listener(StreamListener):
        def on_data(self, data):
            d = json.loads(data)
            print(d['text'])
            twMsg = database.create_new("%BI.TweetMessage", None)
            twMsg.set("DateCreated", d['created_at'])
            twMsg.set("TweetMessage", d['text'])
            twMsg.set("Username", d['user']['screen_name'])
            twMsg.set("TweetID", d['id_str'])

            urls = d['entities']['urls']
            for url in urls:
                twMsg.run_obj_method("AddLink", [url['expanded_url']])

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
    trackFilter = database.run_class_method("%BI.WebExtractor", "GetFilter", [configId])
    # Get authentication from file
    auth = twTOM.Authenticate()
    twitterStream = Stream(auth, listener())
    twitterStream.filter(track=trackFilter, languages=['en'])
    processId = os.getpid()

# various exception handling blocks
except KeyboardInterrupt:
    sys.exit()

except AttributeError as e:
    print('AttributeError was returned')
    pass

except tweepy.TweepError as e:
    print(e)
    if '401' in e:
        # not sure if this will even work
        print('Below is the response that came in')
        print(e)
        time.sleep(60)
        pass
    else:
        #raise an exception if another status code was returned, we don't like other kinds
        raise e

except intersys.pythonbind3.cache_exception as err:
    print ("InterSystems Cache' exception")
    print (sys.exc_type)
    print (sys.exc_value)
    print (sys.exc_traceback)
    print ('Error code:' + str(err))

except Exception as e:
    print('Unhandled exception')
    raise e
