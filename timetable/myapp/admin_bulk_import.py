"""
Admin configuration for Bulk Import models
Allows super admins to manage import requests and templates
"""

from django.contrib import admin
from django.utils.html import format_html
from .models import BulkImportRequest, BulkImportItem, ImportTemplate


@admin.register(BulkImportRequest)
class BulkImportRequestAdmin(admin.ModelAdmin):
    """Admin interface for Bulk Import Requests."""
    
    list_display = [
        'import_type', 'file_format', 'status_badge', 'created_by',
        'total_records', 'success_summary', 'created_at'
    ]
    list_filter = ['status', 'import_type', 'file_format', 'created_at']
    search_fields = ['created_by__email', 'import_type', 'file']
    readonly_fields = [
        'status', 'total_records', 'successful_records', 'failed_records',
        'import_summary', 'error_log', 'created_at', 'processed_at'
    ]
    
    fieldsets = (
        ('Import Details', {
            'fields': ('import_type', 'file_format', 'file', 'created_by')
        }),
        ('Context', {
            'fields': ('department', 'academic_session')
        }),
        ('Status', {
            'fields': ('status', 'created_at', 'processed_at')
        }),
        ('Results', {
            'fields': (
                'total_records', 'successful_records', 'failed_records',
                'import_summary', 'error_log'
            )
        }),
    )
    
    def status_badge(self, obj):
        """Display status as colored badge."""
        colors = {
            'pending': '#FFA500',
            'processing': '#1E90FF',
            'completed': '#28A745',
            'partial': '#FFD700',
            'failed': '#DC3545',
        }
        color = colors.get(obj.status, '#6C757D')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    
    def success_summary(self, obj):
        """Display success/failure summary."""
        total = obj.total_records or 0
        success = obj.successful_records or 0
        failed = obj.failed_records or 0
        
        if total == 0:
            return "—"
        
        success_pct = (success / total * 100) if total > 0 else 0
        return format_html(
            '<span style="color: green;">✓ {}</span> / <span style="color: red;">✗ {}</span> ({:.0f}%)',
            success, failed, success_pct
        )
    success_summary.short_description = 'Success/Failed'
    
    actions = ['mark_as_pending', 'export_errors']
    
    def mark_as_pending(self, request, queryset):
        """Action to reset import status to pending."""
        updated = queryset.update(status='pending', processed_at=None)
        self.message_user(request, f'{updated} imports marked as pending.')
    mark_as_pending.short_description = 'Mark selected imports as pending'
    
    def export_errors(self, request, queryset):
        """Action to export error logs."""
        import csv
        from django.http import HttpResponse
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="import_errors.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Import Type', 'Status', 'Error Count', 'Error Log'])
        
        for imp in queryset:
            writer.writerow([
                imp.get_import_type_display(),
                imp.get_status_display(),
                imp.failed_records,
                imp.error_log
            ])
        
        return response
    export_errors.short_description = 'Export error logs to CSV'


@admin.register(BulkImportItem)
class BulkImportItemAdmin(admin.ModelAdmin):
    """Admin interface for individual Bulk Import Items."""
    
    list_display = [
        'row_number', 'import_request', 'status_badge', 'created_at'
    ]
    list_filter = ['status', 'created_at', 'import_request__import_type']
    search_fields = ['import_request__id', 'error_message']
    readonly_fields = ['import_request', 'row_number', 'raw_data', 'created_at']
    
    fieldsets = (
        ('Import Info', {
            'fields': ('import_request', 'row_number')
        }),
        ('Data', {
            'fields': ('raw_data',)
        }),
        ('Status', {
            'fields': ('status', 'error_message')
        }),
        ('Timestamps', {
            'fields': ('created_at',)
        }),
    )
    
    def status_badge(self, obj):
        """Display status as colored badge."""
        colors = {
            'pending': '#FFA500',
            'success': '#28A745',
            'error': '#DC3545',
            'skipped': '#6C757D',
        }
        color = colors.get(obj.status, '#6C757D')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'


@admin.register(ImportTemplate)
class ImportTemplateAdmin(admin.ModelAdmin):
    """Admin interface for Import Templates."""
    
    list_display = ['template_type', 'created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Template Info', {
            'fields': ('template_type',)
        }),
        ('Configuration', {
            'fields': ('columns', 'example_file')
        }),
        ('Instructions', {
            'fields': ('description',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
