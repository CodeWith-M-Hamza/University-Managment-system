"""
HOW TO UPDATE YOUR admin.py FILE

Simply add this one line at the TOP of your myapp/admin.py file:
"""

# ==========================================
# BULK IMPORT MODELS (NEW)
# ==========================================
from .admin_bulk_import import *

# That's it! The admin interface for bulk imports is now registered.

# Your file should look like:

"""
from django.contrib import admin
from .models import *
from .admin_bulk_import import *  # <-- ADD THIS LINE

# ... rest of your admin registrations ...
"""

# EXPLANATION:
# When you import * from admin_bulk_import.py, it automatically registers:
# - BulkImportRequestAdmin (for tracking import jobs)
# - BulkImportItemAdmin (for viewing individual records)
# - ImportTemplateAdmin (for managing templates)

# Each class has @admin.register() decorator, so they register automatically.
