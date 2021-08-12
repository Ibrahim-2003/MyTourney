from django.contrib import admin
from .models import Teams, Tourney, User, Host

# Register your models here.
admin.site.register(User)
admin.site.register(Teams)
admin.site.register(Tourney)
admin.site.register(Host)