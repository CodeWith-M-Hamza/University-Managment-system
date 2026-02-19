"""
API Views for Bulk Import functionality
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db import transaction
from .models import BulkImportRequest, BulkImportItem, ImportTemplate
from .serializers import BulkImportRequestSerializer, BulkImportCreateSerializer, ImportTemplateSerializer
from .import_utils import process_bulk_import


class BulkImportViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing bulk import requests.
    
    Endpoints:
    - POST /bulk-imports/: Create a new bulk import request
    - GET /bulk-imports/: List all bulk imports
    - GET /bulk-imports/{id}/: Get details of a specific import
    - POST /bulk-imports/{id}/process/: Process/execute the import
    - GET /bulk-imports/{id}/items/: Get items from an import
    - GET /bulk-imports/by-type/{type}/: Get imports by type
    """
    
    queryset = BulkImportRequest.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        """Use different serializer for create vs retrieve."""
        if self.action == 'create':
            return BulkImportCreateSerializer
        return BulkImportRequestSerializer
    
    def get_queryset(self):
        """Filter imports by user."""
        return BulkImportRequest.objects.filter(created_by=self.request.user).order_by('-created_at')
    
    def create(self, request, *args, **kwargs):
        """Create a new bulk import request."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Return the created object with full details
        import_request = serializer.instance
        return Response(
            BulkImportRequestSerializer(import_request).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['post'])
    def process(self, request, pk=None):
        """
        Process/execute the bulk import.
        This will parse the file and import the data.
        """
        import_request = self.get_object()
        
        # Check if already processed
        if import_request.status in ['completed', 'processing', 'partial']:
            return Response(
                {'error': f'Import already in {import_request.status} status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Process the import (this may take a while for large files)
            successful, failed, errors = process_bulk_import(import_request)
            
            return Response({
                'status': 'success',
                'message': f'Imported {successful} records successfully',
                'successful_records': successful,
                'failed_records': failed,
                'errors': errors,
                'import_request': BulkImportRequestSerializer(import_request).data
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e),
                'import_request': BulkImportRequestSerializer(import_request).data
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def items(self, request, pk=None):
        """Get all items (rows) from a bulk import."""
        import_request = self.get_object()
        items = import_request.items.all()
        
        # Pagination support
        limit = request.query_params.get('limit', 50)
        offset = request.query_params.get('offset', 0)
        
        try:
            items = items[int(offset):int(offset) + int(limit)]
        except (ValueError, TypeError):
            pass
        
        from .serializers import BulkImportItemSerializer
        serializer = BulkImportItemSerializer(items, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Get imports filtered by type."""
        import_type = request.query_params.get('type', None)
        
        if not import_type:
            return Response(
                {'error': 'type parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        imports = self.get_queryset().filter(import_type=import_type)
        serializer = self.get_serializer(imports, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent bulk imports (last 10)."""
        imports = self.get_queryset()[:10]
        serializer = self.get_serializer(imports, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get statistics about bulk imports."""
        imports = self.get_queryset()
        
        total_imports = imports.count()
        total_records = sum(imp.total_records for imp in imports)
        total_successful = sum(imp.successful_records for imp in imports)
        total_failed = sum(imp.failed_records for imp in imports)
        
        by_status = {}
        for status_choice in BulkImportRequest._meta.get_field('status').choices:
            status_val = status_choice[0]
            count = imports.filter(status=status_val).count()
            by_status[status_val] = count
        
        by_type = {}
        for type_choice in BulkImportRequest._meta.get_field('import_type').choices:
            type_val = type_choice[0]
            count = imports.filter(import_type=type_val).count()
            by_type[type_val] = count
        
        return Response({
            'total_imports': total_imports,
            'total_records': total_records,
            'total_successful': total_successful,
            'total_failed': total_failed,
            'by_status': by_status,
            'by_type': by_type
        })


class ImportTemplateViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for import templates.
    Users can view templates to understand the required format for bulk imports.
    
    Endpoints:
    - GET /import-templates/: List all templates
    - GET /import-templates/{id}/: Get a specific template
    - GET /import-templates/by-type/{type}/: Get template by import type
    """
    
    queryset = ImportTemplate.objects.all()
    serializer_class = ImportTemplateSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Get template by import type."""
        template_type = request.query_params.get('type', None)
        
        if not template_type:
            return Response(
                {'error': 'type parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            template = ImportTemplate.objects.get(template_type=template_type)
            serializer = self.get_serializer(template)
            return Response(serializer.data)
        except ImportTemplate.DoesNotExist:
            return Response(
                {'error': f'No template found for type: {template_type}'},
                status=status.HTTP_404_NOT_FOUND
            )
