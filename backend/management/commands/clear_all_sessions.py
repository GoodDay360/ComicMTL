from django.core.management.base import BaseCommand
from django.contrib.sessions.models import Session
from django.db import connections

class Command(BaseCommand):
    help = 'Clear all sessions'

    def handle(self, *args, **options):
        for db in connections.databases:
            Session.objects.using(db).all().delete()
        self.stdout.write('All sessions have been cleared.')
