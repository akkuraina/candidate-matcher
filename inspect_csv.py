#!/usr/bin/env python3
"""Quick diagnostic script to inspect CSV structure and content"""
import csv
import sys
from pathlib import Path

def inspect_csv(file_path):
    """Inspect first few rows of CSV"""
    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        print(f"\n📋 CSV STRUCTURE - {Path(file_path).name}\n")
        print(f"COLUMNS ({len(reader.fieldnames)}):")
        for i, col in enumerate(reader.fieldnames, 1):
            print(f"  {i}. {col}")
        
        print("\n" + "="*80)
        print("\nFIRST ROW DATA:\n")
        
        rows = list(reader)
        if rows:
            first_row = rows[0]
            for col, value in first_row.items():
                truncated = str(value)[:100] if value else "[EMPTY]"
                print(f"  {col}: {truncated}")
            
            print("\n" + "="*80)
            print("\nSKILL-RELATED FIELDS:")
            print("\nCandidate skill columns:")
            skill_cols = ['parsed_skills', 'programming_languages', 'backend_frameworks', 
                         'frontend_technologies', 'mobile_technologies']
            for col in skill_cols:
                if col in first_row:
                    val = str(first_row[col])[:150] if first_row[col] else "[EMPTY]"
                    print(f"  ✓ {col}: {val}")
                else:
                    print(f"  ✗ {col}: [NOT FOUND]")
            
            print("\n" + "="*80)
            if len(rows) > 1:
                print(f"\nTotal rows: {len(rows)}")
        else:
            print("No data rows found!")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python inspect_csv.py <csv_file_path>")
        print("\nExample:")
        print("  python inspect_csv.py candidates.csv")
        sys.exit(1)
    
    file_path = sys.argv[1]
    if not Path(file_path).exists():
        print(f"❌ File not found: {file_path}")
        sys.exit(1)
    
    inspect_csv(file_path)
