#!/usr/bin/python
import codecs, sys, json, time, datetime
from TwitterSearch import *
import intersys.pythonbind3

namespace = sys.argv[1]
keyword = sys.argv[2]

# Connect to specified machine, in the specified NAMESPACE
cache_host = "localhost"
cache_port = "1972"
cache_namespace = namespace
cache_username = "_SYSTEM"
cache_password = "SYS"

parsedKeyword = keyword.split(sep=",")

try:
    url = cache_host + "["+cache_port+"]:" + cache_namespace
    conn = intersys.pythonbind3.connection()
    conn.connect_now(url, cache_username, cache_password, None)

    # Get account setting from globals
    database = intersys.pythonbind3.database(conn)
    cacheSettings = database.run_class_method("%BI.WebExtractor", "GetTwitterSettings", [])
    consumer_key = cacheSettings[0]
    consumer_secret = cacheSettings[1]
    access_token = cacheSettings[2]
    access_token_secret = cacheSettings[3]

    tso = TwitterSearchOrder()
    tso.set_keywords(parsedKeyword)
    tso.set_language('en')
    tso.set_result_type('recent')
    tso.set_count(2)

    ts = TwitterSearch(
        consumer_key = consumer_key,
        consumer_secret = consumer_secret,
        access_token = access_token,
        access_token_secret = access_token_secret
    )

    results = []
    for tweet in ts.search_tweets_iterable(tso):
        # replace all these with class method
        result = dict()
        result['tweetDate'] = tweet['created_at']
        result['tweetMsg'] = tweet['text']
        result['tweetUsername'] = tweet['user']['screen_name']
        result['tweetId'] = tweet['id_str']
        results.append(result)


    resultsInJSON = json.dumps(results)
    #print(resultsInJSON)
    database.run_class_method("%BI.WebExtractor", "SetTweetToGlobal", [resultsInJSON])

except TwitterSearchException as e:
    print('Twitter Search Error:')
    print(e)

except intersys.pythonbind3.cache_exception as err:
    print("Error from Intersystems plugin")
    print(err)

except Exception as e:
    print("General Error: ")
    print(e)
