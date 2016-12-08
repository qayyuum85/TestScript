# load properties from files
# from http://www.linuxtopia.org/online_books/programming_books/python_programming/python_ch34s04.html
from tweepy import OAuthHandler

def getprops(filename):
	propDict= dict()
	try:
		with open (filename, "r") as propFile:
			for propLine in propFile:
				propDef= propLine.strip()
				if len(propDef) == 0:
					continue
				if propDef[0] in ( '!', '#' ):
					continue
				punctuation= [ propDef.find(c) for c in ':= ' ] + [ len(propDef) ]
				found= min( [ pos for pos in punctuation if pos != -1 ] )
				name= propDef[:found].rstrip()
				value= propDef[found:].lstrip(":= ").rstrip()
				propDict[name]= value
		propFile.close()
	except (IOError):
		print (filename + ".properties not found")
	return propDict

def Authenticate():
    # load secrets
    secrets = getprops("WIBIS.properties")
    auth = OAuthHandler(secrets['CONSUMER_KEY'], secrets['CONSUMER_SECRET'])
    auth.set_access_token(secrets['ACCESS_KEY'], secrets['ACCESS_SECRET'])
    return auth
