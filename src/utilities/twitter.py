import tweepy
from io import BytesIO
from PIL import Image
import tweepy

import sys

title = sys.argv[1]
imgpath = sys.argv[2]

def env_variables():
    consumer_key = "6KBI2eAdXFEXD7T3HeR7pUO2N"
    consumer_secret = "Sh4J8JVxydVtaeU322ZNHhWJAFOIcdtnILVR4alCgMkx9of1fb"
    access_token = "1591464303202295811-HYfOOzyUdQADXjBFtmEyjyFnWyOKiV"
    access_ts = "zATNb2XMXInDUJsFjdvF5VcxS1h3NLLQwWrbnfG47JZVS"
    return consumer_key, consumer_secret, access_token, access_ts


def authorize(consumer_key, consumer_secret, access_token, access_ts):
    auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
    auth.set_access_token(access_token, access_ts)
    api = tweepy.API(auth)
    return api


# Example image manipulation
img = Image.open(imgpath)

# Do something to the image...

# Save image in-memory
b = BytesIO()
img.save(b, "PNG")
b.seek(0)

def post(api):
    ret = api.media_upload(filename=title, file=b)
    return api.update_status(media_ids=[ret.media_id_string], status=title)

def main():
    consumer_key, consumer_secret, access_token, access_ts = env_variables()
    api = authorize(consumer_key, consumer_secret, access_token, access_ts)
    post(api)


if __name__ == "__main__":
    main()
