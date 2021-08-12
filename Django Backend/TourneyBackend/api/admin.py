from django.contrib import admin
from .models import Team, Tourney, User, Host

# Register your models here.
admin.site.register(User)
admin.site.register(Team)
admin.site.register(Tourney)
admin.site.register(Host)