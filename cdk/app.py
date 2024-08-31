#!/usr/bin/env python3
import os
from dotenv import load_dotenv
import aws_cdk as cdk
from photosky_stack import PhotoskyStack

load_dotenv()

app = cdk.App()
PhotoskyStack(app, os.getenv("APP_NAME"),)
app.synth()
