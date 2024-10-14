
from django.contrib import admin
from django.urls import path, include, re_path
from frontend import views
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('assets/<path:file>/', views.assets_serve),
    path('(tabs)/<path:file>/', views.assets_serve),
    
    path('manifest.webmanifest/', views.manifest),
    path('manifest.webmanifest', views.manifest),

    path('', views.App),
    re_path(r'^.*/$', views.App),
    # path('_expo/<str:file>', views.static_serve),
]