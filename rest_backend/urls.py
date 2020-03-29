from django.urls import path

from . import views

urlpatterns = [
    path('main/', views.main, name="main"),
    path('getview/', views.getview, name='getview'),
    path('addplayer/', views.addplayer, name='addplayer'),
    path('removeplayer/', views.removeplayer, name='removeplayer'),
    path('startgame/', views.startgame, name='startgame'),
    path('stopgame/', views.stopgame, name='stopgame'),
    path('announcetricks/', views.announcetricks, name='announcetricks'),
    path('playcard/', views.playcard, name='playcard'),
    path('getjson/', views.getjson, name='getjson'),
]