from datetime import datetime, timedelta
from unittest import result
from dateutil.relativedelta import relativedelta
import pytz

class utc_time():
    # Get current time
    def __init__(self) -> None:
        self.current_time = datetime.now()
    
    def get(self):
       return self.current_time.astimezone(pytz.UTC)
   
    def add(self, value):
        amount, unit = value
        if unit == 'year':
            self.current_time += relativedelta(years=int(amount))
        elif unit == 'month':
            self.current_time += relativedelta(months=int(amount))
        elif unit == 'week':
            self.current_time += relativedelta(weeks=int(amount))
        elif unit == 'day':
            self.current_time += relativedelta(days=int(amount))
        elif unit == 'hour':
            self.current_time += relativedelta(hours=int(amount))
        elif unit == 'minute':
            self.current_time += relativedelta(minutes=int(amount))
        elif unit == 'second':
            self.current_time += relativedelta(seconds=int(amount))
        elif unit == 'millisecond':
            self.current_time += relativedelta(microseconds=int(amount)*1000)
        else: raise Exception("[date_utils] Error: Add unit not found.")
        # Add more units as needed...
        return self
    
    
def convert_utc(dt):
    utc_time = dt.astimezone(pytz.UTC)
    return utc_time

def startOf(dt):
    start_of = datetime(dt.year, dt.month, dt.day)
    return start_of

def endOf(dt):
    end_of = startOf(dt) + timedelta(days=1, seconds=-1)
    return end_of
