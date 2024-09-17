# Generated by Django 5.1.1 on 2024-09-17 12:23

import backend.module.utils.date_utils
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0002_cloudflareturnstilecache_alter_requestcache_datetime'),
    ]

    operations = [
        migrations.AlterField(
            model_name='cloudflareturnstilecache',
            name='datetime',
            field=models.DateTimeField(default=backend.module.utils.date_utils.utc_time.get),
        ),
        migrations.AlterField(
            model_name='requestcache',
            name='datetime',
            field=models.DateTimeField(default=backend.module.utils.date_utils.utc_time.get),
        ),
    ]