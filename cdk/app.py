#!/usr/bin/env python3
import os
import aws_cdk as cdk
from photosky_stack import PhotoskyStack


app = cdk.App()
PhotoskyStack(app, "PhotoskyStack")
app.synth()
