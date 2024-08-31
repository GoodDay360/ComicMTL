from django.contrib import admin
from django.urls import path, include, re_path
# from core import views

# from django.contrib.sitemaps.views import sitemap, index
# from frontend.sitemaps import  StaticSitemap, ChapterSitemap, LessonSitemap

# sitemaps = {
#     'StaticSitemap': StaticSitemap,
#     'ChapterSitemap': ChapterSitemap,
#     'LessonSitemap': LessonSitemap,
# }

urlpatterns = [
    # path('favicon.ico', views.favicon),
    path('api/', include('backend.urls')),
    path('worker/', include('worker.urls')),
    path('', include('frontend.urls')),
    
    # path('sitemap.xml', index, {'sitemaps': sitemaps}, name='django.contrib.sitemaps.views.index'),
    # path('sitemap-<section>.xml', views.get_sitemap, {'sitemaps': sitemaps}, name='django.contrib.sitemaps.views.sitemap'),
    
]
