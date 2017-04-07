#!/usr/bin/python
import codecs, sys, json, time, os
import tweepy
from tweepy import Stream
from tweepy.streaming import StreamListener
from twTOM import getprops
import twTOM
import intersys.pythonbind3

# Get configuration Id from command line
# Please hardcode this value in case you are running from the notebook
configId = 2
secrets = getprops("WIBIS.properties")
user = secrets['USERNAME']
password = secrets['PASSWORD']
host = secrets['HOST']
port = secrets['PORT']
ns = 'SMSWIBIS'

print('Running Twitter Streaming Service...')
print('You can interrupt this process by pressing Ctrl-C or Delete. It will take a few moment before the service is stopped.')
print('You can rerun this again by pasting this command:')
print(r'python C:\InterSystems\Cache\CSP\sys\bi\python\TwitterStreamtoCacheWIBIS.py')

class listener(StreamListener):
    def on_data(self, data):
        d = json.loads(data)
        #print(d['text'])
        print('Tweet found at' + str(d['created_at']) + ' by ' + str(d['user']['screen_name']))
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
        time.sleep(60)
        return True

# Connect to specified machine, in the SAMPLES namespace
url = host + "["+port+"]:" + ns
conn = intersys.pythonbind3.connection()
conn.connect_now(url, user, password, None)
database = intersys.pythonbind3.database(conn)

# Get filter based on WebExtractor setting
trackFilter = database.run_class_method("%BI.WebExtractor", "GetFilter", [configId])

# Get authentication from file
auth = twTOM.Authenticate()

while True:
    try:
        twitterStream = Stream(auth, listener(), timeout=60)
        twitterStream.filter(track=trackFilter, languages=['en'])
        processId = os.getpid()

    # various exception handling blocks
    except KeyboardInterrupt:
        print('Keyboard Interrupt detected. Ending service...')
        sys.exit()

    except AttributeError as e:
        print('AttributeError was returned')
        time.sleep(60)
        pass

    except tweepy.TweepError as e:
        print('Below is the response that came in')
        print(e)
        time.sleep(60)
        pass

    except intersys.pythonbind3.cache_exception as err:
        print ("InterSystems Cache' exception")
        print(err)
        time.sleep(60)
        pass

    except Exception as e:
        print('Unhandled exception')
        print(e)
        time.sleep(60)
        pass
