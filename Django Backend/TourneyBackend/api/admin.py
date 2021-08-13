from django.contrib import admin
from .models import Game, Team, Tourney, Transaction, User, Host

# Register your models here.
admin.site.register(User)
admin.site.register(Team)
admin.site.register(Tourney)
admin.site.register(Host)
admin.site.register(Transaction)
admin.site.register(Game)