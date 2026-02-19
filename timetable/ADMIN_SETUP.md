"""
IMPORTANT: Copy this configuration to your myapp/admin.py file

This enables the bulk import admin interface
"""

# Add this import at the top of your admin.py:
from .admin_bulk_import import *

# OR, if you prefer to be more explicit:
from .admin_bulk_import import BulkImportRequestAdmin, BulkImportItemAdmin, ImportTemplateAdmin

# The models are automatically registered when you import from admin_bulk_import
# So you don't need to add anything else!

# Your existing admin registrations for other models can stay as they are
