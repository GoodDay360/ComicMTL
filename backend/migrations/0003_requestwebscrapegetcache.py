# Generated by Django 5.1.1 on 2024-12-07 15:52

import backend.models.model_cache
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0002_alter_requestwebscrapegetcovercache_id'),
    ]

    operations = [
        migrations.CreateModel(
            name='RequestWebScrapeGetCache',
            fields=[
                ('page', models.IntegerField(primary_key=True, serialize=False)),
                ('source', models.TextField()),
                ('comic_id', models.TextField()),
                ('datetime', models.DateTimeField(default=backend.models.model_cache.get_current_utc_time)),
            ],
        ),
    ]
