import inspect
import backend.models.model_cache as model_cache
import backend.models.model_1 as model_1
import backend.models.model_2 as model_2

CACHE_MODELS = [cls.__name__.lower() for name, cls in inspect.getmembers(model_cache, inspect.isclass) if cls.__module__ == model_cache.__name__]
DB1_MODELS = [cls.__name__.lower() for name, cls in inspect.getmembers(model_1, inspect.isclass) if cls.__module__ == model_1.__name__]
DB2_MODELS = [cls.__name__.lower() for name, cls in inspect.getmembers(model_2, inspect.isclass) if cls.__module__ == model_2.__name__]

class Router:
    def db_for_read(self, model, **hints):
        if model._meta.model_name in CACHE_MODELS:
            return 'cache'
        elif model._meta.model_name in DB1_MODELS:
            return 'DB1'
        elif model._meta.model_name in DB2_MODELS:
            return 'DB2'
        return 'default'

    def db_for_write(self, model, **hints):
        if model._meta.model_name in CACHE_MODELS:
            return 'cache'
        elif model._meta.model_name in DB1_MODELS:
            return 'DB1'
        elif model._meta.model_name in DB2_MODELS:
            return 'DB2'
        return 'default'

    def allow_relation(self, obj1, obj2, **hints):
        return True

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        if model_name in CACHE_MODELS:
            return db == 'cache'
        elif model_name in DB1_MODELS:
            return db == 'DB1'
        elif model_name in DB2_MODELS:
            return db == 'DB2'
        return db == 'default'
