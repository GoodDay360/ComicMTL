# Generated by Django 5.1.1 on 2024-09-17 12:52

import backend.module.utils.date_utils
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0005_remove_cloudflareturnstilecache_id_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='requestcache',
            name='id',
        ),
        migrations.AlterField(
            model_name='cloudflareturnstilecache',
            name='datetime',
            field=models.DateTimeField(default=backend.module.utils.date_utils.utc_time.get),
        ),
        migrations.AlterField(
            model_name='requestcache',
            name='client',
            field=models.UUIDField(primary_key=True, serialize=False),
        ),
        migrations.AlterField(
            model_name='requestcache',
            name='datetime',
            field=models.DateTimeField(default=backend.module.utils.date_utils.utc_time.get),
        ),
    ]