# Save to database
def saveToDB(parsedObj, category):
    secrets = getprops("WIBIS.properties")
    user = secrets['USERNAME'];
    password = secrets['PASSWORD'];
    host = secrets['HOST'];
    port = secrets['PORT'];

    try:
        url = host+"["+port+"]:SMSWIBIS"
        conn = intersys.pythonbind3.connection()
        conn.connect_now(url, user, password, None)
        database = intersys.pythonbind3.database(conn)

        if (len(parsedObj.entries)!=0):
            entries = parsedObj.entries
            for entry in entries:
                entryTimeStamp = convertToLocal(entry['published_parsed'])
                sc = database.run_class_method('%BI.RSSTemp','FetchData',[entry.summary, entry.title, category, entry.link, entry.id, entryTimeStamp[0], entryTimeStamp[1]])
                #print(sc);
                #print(entry.title);

    except intersys.pythonbind3.cache_exception ( err ):
        print ("InterSystems Cache' exception")
        print (sys.exc_type)
        print (sys.exc_value)
        print (sys.exc_traceback)
        print (str(err))
