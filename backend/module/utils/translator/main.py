import os
import asyncio
import logging
from argparse import Namespace
from manga_translator import args

args = args.parser.parse_args()

print(args.mode)
