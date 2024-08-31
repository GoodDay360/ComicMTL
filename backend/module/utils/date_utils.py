from datetime import datetime, timedelta
from unittest import result
from dateutil.relativedelta import relativedelta
import pytz

def get_utc_time(add=None):
    # Get current time
    current_time = datetime.now()
    if add:
        amount, unit = add
        if unit == 'year':
            current_time += relativedelta(years=int(amount))
        elif unit == 'month':
            current_time += relativedelta(months=int(amount))
        elif unit == 'week':
            current_time += relativedelta(weeks=int(amount))
        elif unit == 'day':
            current_time += relativedelta(days=int(amount))
        elif unit == 'hour':
            current_time += relativedelta(hours=int(amount))
        elif unit == 'minute':
            current_time += relativedelta(minutes=int(amount))
        elif unit == 'second':
            current_time += relativedelta(seconds=int(amount))
        elif unit == 'millisecond':
            current_time += relativedelta(microseconds=int(amount)*1000)
        else: raise Exception("[date_utils] Error: Add unit not found.")
        # Add more units as needed...

    # Convert to UTC
    utc_time = current_time.astimezone(pytz.UTC)

    return utc_time

def convert_utc(dt):
    utc_time = dt.astimezone(pytz.UTC)
    return utc_time

def startOf(dt):
    start_of = datetime(dt.year, dt.month, dt.day)
    return start_of

def endOf(dt):
    end_of = startOf(dt) + timedelta(days=1, seconds=-1)
    return end_of
