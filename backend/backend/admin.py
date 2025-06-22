from django.contrib import admin
from simple_history.admin import SimpleHistoryAdmin

from . import models

# Disable this action across the whole admin panel
admin.site.disable_action("delete_selected")


class ConversationAdmin(SimpleHistoryAdmin):
    ordering = ["created"]
    list_display = ["id", "created", "title", "owner"]


admin.site.register(models.Conversation, ConversationAdmin)
admin.site.register(models.ConversationMember, SimpleHistoryAdmin)


class MessageAdmin(SimpleHistoryAdmin):
    ordering = ["-created"]
    list_display = ["id", "reply_to_id", "conversation_id", "created", "author", "llm"]


admin.site.register(models.Message, MessageAdmin)


class UserAdmin(SimpleHistoryAdmin):
    list_display = ["id", "name", "email", "username", "last_login"]


admin.site.register(models.User, UserAdmin)


class SettingAdmin(SimpleHistoryAdmin):
    list_display = ["id", "user", "modified"]


admin.site.register(models.Setting, SettingAdmin)
