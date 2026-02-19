"""
Utility functions for handling bulk imports from Excel, CSV, and Word files.
Supports importing: Sections, Sessions, Teachers, Students, Courses, Rooms, Time Slots, Assignments
"""

import json
import openpyxl
import csv
from io import StringIO, BytesIO
from datetime import datetime
from typing import List, Dict, Tuple, Any

# Optional: For parsing Word documents
try:
    from docx import Document
    HAS_DOCX = True
except ImportError:
    HAS_DOCX = False

from django.contrib.auth import get_user_model
from .models import (
    Department, AcademicSession, ClassSection, Teacher, Student, 
    Course, Room, TimeSlot, TeacherAssignment, BulkImportRequest, 
    BulkImportItem, User
)

# ========================
# File Parser Classes
# ========================

class BaseFileParser:
    """Base class for file parsing."""
    
    def __init__(self, file_obj):
        self.file = file_obj
        self.rows = []
        self.headers = []
    
    def parse(self) -> List[Dict[str, Any]]:
        """Parse file and return list of dictionaries (rows)."""
        raise NotImplementedError
    
    def _standardize_headers(self, headers: List[str]) -> List[str]:
        """Standardize header names to lowercase, remove extra spaces."""
        return [h.strip().lower().replace(' ', '_') for h in headers]


class ExcelParser(BaseFileParser):
    """Parser for Excel files (.xlsx, .xls)."""
    
    def parse(self) -> List[Dict[str, Any]]:
        """Parse Excel file using openpyxl."""
        try:
            workbook = openpyxl.load_workbook(self.file)
            worksheet = workbook.active
            
            rows = []
            headers = None
            
            for idx, row in enumerate(worksheet.iter_rows(values_only=True), 1):
                if idx == 1:
                    # First row is headers
                    headers = self._standardize_headers([str(h) if h else f"column_{i}" for i, h in enumerate(row)])
                    continue
                
                if not any(row):  # Skip empty rows
                    continue
                
                row_dict = {}
                for i, value in enumerate(row):
                    if i < len(headers):
                        row_dict[headers[i]] = value
                
                rows.append(row_dict)
            
            return rows
        except Exception as e:
            raise ValueError(f"Error parsing Excel file: {str(e)}")


class CSVParser(BaseFileParser):
    """Parser for CSV files (.csv)."""
    
    def parse(self) -> List[Dict[str, Any]]:
        """Parse CSV file."""
        try:
            # Handle both text and binary file objects
            if isinstance(self.file, bytes):
                content = self.file.decode('utf-8')
            else:
                content = self.file.read()
                if isinstance(content, bytes):
                    content = content.decode('utf-8')
            
            reader = csv.DictReader(StringIO(content))
            rows = list(reader)
            
            # Standardize headers
            if rows:
                standardized_rows = []
                for row in rows:
                    standardized_row = {self._standardize_headers([k])[0]: v for k, v in row.items()}
                    standardized_rows.append(standardized_row)
                return standardized_rows
            
            return rows
        except Exception as e:
            raise ValueError(f"Error parsing CSV file: {str(e)}")


class WordParser(BaseFileParser):
    """Parser for Word documents (.docx)."""
    
    def parse(self) -> List[Dict[str, Any]]:
        """Parse Word document (tables only)."""
        if not HAS_DOCX:
            raise ImportError("python-docx is not installed. Install it with: pip install python-docx")
        
        try:
            doc = Document(self.file)
            rows = []
            
            # Extract tables from Word document
            for table in doc.tables:
                # First row is headers
                if not table.rows:
                    continue
                
                headers = self._standardize_headers([cell.text.strip() for cell in table.rows[0].cells])
                
                # Remaining rows are data
                for row in table.rows[1:]:
                    row_data = {}
                    for i, cell in enumerate(row.cells):
                        if i < len(headers):
                            row_data[headers[i]] = cell.text.strip()
                    
                    if any(row_data.values()):  # Skip empty rows
                        rows.append(row_data)
            
            return rows
        except Exception as e:
            raise ValueError(f"Error parsing Word document: {str(e)}")


# ========================
# Data Importers (per type)
# ========================

class BaseImporter:
    """Base class for data importers."""
    
    def __init__(self, import_request: BulkImportRequest, rows: List[Dict[str, Any]]):
        self.import_request = import_request
        self.rows = rows
        self.errors = []
        self.success_count = 0
        self.created_objects = []
    
    def import_all(self) -> Tuple[int, int, List[str]]:
        """
        Import all rows.
        Returns: (successful_count, failed_count, error_messages)
        """
        raise NotImplementedError
    
    def _create_bulk_import_item(self, row_num: int, raw_data: Dict, status: str, error_msg: str = ""):
        """Helper to create a BulkImportItem record."""
        item = BulkImportItem.objects.create(
            import_request=self.import_request,
            row_number=row_num,
            raw_data=raw_data,
            status=status,
            error_message=error_msg
        )
        return item


class ClassSectionImporter(BaseImporter):
    """Import class sections from file data."""
    
    # Expected columns: name, section_code, department, academic_session, total_students, semester, year
    
    def import_all(self) -> Tuple[int, int, List[str]]:
        """Import all class sections."""
        for idx, row in enumerate(self.rows, start=2):  # Start from row 2 (after headers)
            try:
                # Validate required fields
                name = row.get('name', '').strip()
                section_code = row.get('section_code', '').strip()
                dept_name = row.get('department', '').strip()
                session_name = row.get('academic_session', '').strip()
                
                if not all([name, section_code, dept_name, session_name]):
                    raise ValueError("Missing required fields: name, section_code, department, academic_session")
                
                # Get department
                department = Department.objects.get(name__iexact=dept_name)
                
                # Get academic session
                academic_session = AcademicSession.objects.get(name__iexact=session_name)
                
                # Create section
                section = ClassSection.objects.create(
                    name=name,
                    section_code=section_code,
                    department=department,
                    academic_session=academic_session,
                    total_students=int(row.get('total_students', 0) or 0),
                    semester=int(row.get('semester', 1) or 1),
                    year=int(row.get('year', 1) or 1)
                )
                
                self._create_bulk_import_item(idx, row, 'success')
                self.created_objects.append(section.id)
                self.success_count += 1
                
            except Exception as e:
                error_msg = str(e)
                self.errors.append(f"Row {idx}: {error_msg}")
                self._create_bulk_import_item(idx, row, 'error', error_msg)
        
        return self.success_count, len(self.rows) - self.success_count, self.errors


class AcademicSessionImporter(BaseImporter):
    """Import academic sessions from file data."""
    
    # Expected columns: name, session_type, department, start_date, end_date, is_active
    
    def import_all(self) -> Tuple[int, int, List[str]]:
        """Import all academic sessions."""
        for idx, row in enumerate(self.rows, start=2):
            try:
                name = row.get('name', '').strip()
                session_type = row.get('session_type', 'morning').strip().lower()
                dept_name = row.get('department', '').strip()
                start_date_str = row.get('start_date', '').strip()
                end_date_str = row.get('end_date', '').strip()
                
                if not all([name, dept_name, start_date_str, end_date_str]):
                    raise ValueError("Missing required fields: name, department, start_date, end_date")
                
                # Get department
                department = Department.objects.get(name__iexact=dept_name)
                
                # Parse dates (support multiple formats)
                try:
                    start_date = self._parse_date(start_date_str)
                    end_date = self._parse_date(end_date_str)
                except ValueError as date_err:
                    raise ValueError(f"Invalid date format: {str(date_err)}")
                
                # Create session
                session = AcademicSession.objects.create(
                    name=name,
                    session_type=session_type if session_type in ['morning', 'evening'] else 'morning',
                    department=department,
                    start_date=start_date,
                    end_date=end_date,
                    is_active=row.get('is_active', 'true').lower() in ['true', '1', 'yes']
                )
                
                self._create_bulk_import_item(idx, row, 'success')
                self.created_objects.append(session.id)
                self.success_count += 1
                
            except Exception as e:
                error_msg = str(e)
                self.errors.append(f"Row {idx}: {error_msg}")
                self._create_bulk_import_item(idx, row, 'error', error_msg)
        
        return self.success_count, len(self.rows) - self.success_count, self.errors
    
    @staticmethod
    def _parse_date(date_str: str):
        """Parse various date formats."""
        formats = ['%Y-%m-%d', '%m/%d/%Y', '%d/%m/%Y', '%d-%m-%Y']
        for fmt in formats:
            try:
                return datetime.strptime(date_str, fmt).date()
            except ValueError:
                continue
        raise ValueError(f"Could not parse date: {date_str}")


class RoomImporter(BaseImporter):
    """Import rooms from file data."""
    
    # Expected columns: room_number, room_type, capacity, department
    
    def import_all(self) -> Tuple[int, int, List[str]]:
        """Import all rooms."""
        for idx, row in enumerate(self.rows, start=2):
            try:
                room_number = row.get('room_number', '').strip()
                room_type = row.get('room_type', 'classroom').strip().lower()
                capacity = int(row.get('capacity', 30) or 30)
                dept_name = row.get('department', '').strip()
                
                if not all([room_number, dept_name]):
                    raise ValueError("Missing required fields: room_number, department")
                
                department = Department.objects.get(name__iexact=dept_name)
                
                room = Room.objects.create(
                    room_number=room_number,
                    room_type=room_type if room_type in ['classroom', 'lab'] else 'classroom',
                    capacity=capacity,
                    department=department
                )
                
                self._create_bulk_import_item(idx, row, 'success')
                self.created_objects.append(room.id)
                self.success_count += 1
                
            except Exception as e:
                error_msg = str(e)
                self.errors.append(f"Row {idx}: {error_msg}")
                self._create_bulk_import_item(idx, row, 'error', error_msg)
        
        return self.success_count, len(self.rows) - self.success_count, self.errors


class TimeSlotImporter(BaseImporter):
    """Import time slots from file data."""
    
    # Expected columns: day, start_time, end_time, slot_name
    
    def import_all(self) -> Tuple[int, int, List[str]]:
        """Import all time slots."""
        for idx, row in enumerate(self.rows, start=2):
            try:
                day = row.get('day', '').strip().lower()
                start_time_str = row.get('start_time', '').strip()
                end_time_str = row.get('end_time', '').strip()
                slot_name = row.get('slot_name', '').strip()
                
                if not all([day, start_time_str, end_time_str, slot_name]):
                    raise ValueError("Missing required fields: day, start_time, end_time, slot_name")
                
                # Validate day
                valid_days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
                if day not in valid_days:
                    raise ValueError(f"Invalid day: {day}. Must be one of {valid_days}")
                
                # Parse times
                try:
                    start_time = datetime.strptime(start_time_str, '%H:%M').time()
                    end_time = datetime.strptime(end_time_str, '%H:%M').time()
                except ValueError:
                    raise ValueError("Invalid time format. Use HH:MM (24-hour format)")
                
                time_slot = TimeSlot.objects.create(
                    day=day,
                    start_time=start_time,
                    end_time=end_time,
                    slot_name=slot_name
                )
                
                self._create_bulk_import_item(idx, row, 'success')
                self.created_objects.append(time_slot.id)
                self.success_count += 1
                
            except Exception as e:
                error_msg = str(e)
                self.errors.append(f"Row {idx}: {error_msg}")
                self._create_bulk_import_item(idx, row, 'error', error_msg)
        
        return self.success_count, len(self.rows) - self.success_count, self.errors


# ========================
# Main Import Orchestrator
# ========================

def process_bulk_import(import_request: BulkImportRequest):
    """
    Main function to process a bulk import request.
    Handles file parsing and data import based on import type.
    """
    try:
        # Parse the file based on format
        if import_request.file_format == 'excel':
            parser = ExcelParser(import_request.file)
        elif import_request.file_format == 'csv':
            parser = CSVParser(import_request.file)
        elif import_request.file_format == 'word':
            parser = WordParser(import_request.file)
        else:
            raise ValueError(f"Unsupported file format: {import_request.file_format}")
        
        rows = parser.parse()
        import_request.total_records = len(rows)
        import_request.status = 'processing'
        import_request.save()
        
        # Select appropriate importer
        if import_request.import_type == 'sections':
            importer = ClassSectionImporter(import_request, rows)
        elif import_request.import_type == 'sessions':
            importer = AcademicSessionImporter(import_request, rows)
        elif import_request.import_type == 'rooms':
            importer = RoomImporter(import_request, rows)
        elif import_request.import_type == 'timeslots':
            importer = TimeSlotImporter(import_request, rows)
        else:
            raise ValueError(f"Import type not yet implemented: {import_request.import_type}")
        
        # Run the import
        successful, failed, errors = importer.import_all()
        
        # Update import request
        import_request.successful_records = successful
        import_request.failed_records = failed
        import_request.import_summary = json.dumps({
            'created_ids': importer.created_objects,
            'total_processed': len(rows)
        })
        import_request.error_log = '\n'.join(errors) if errors else ''
        import_request.processed_at = datetime.now()
        import_request.status = 'completed' if failed == 0 else 'partial' if successful > 0 else 'failed'
        import_request.save()
        
        return successful, failed, errors
        
    except Exception as e:
        import_request.status = 'failed'
        import_request.error_log = str(e)
        import_request.processed_at = datetime.now()
        import_request.save()
        raise
