import sqlite3
import os
import shutil
from datetime import datetime, timedelta

# Create the output directory
output_dir = "./spencer-sabrina-audio"
os.makedirs(output_dir, exist_ok=True)

# Connect to the iMessage database
db_path = os.path.expanduser('~/Library/Messages/chat.db')
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Replace with the phone number or email
contact_identifier = "+18324524392"  # Adjust as needed

query = """
SELECT 
    attachment.filename,
    attachment.created_date
FROM attachment
JOIN message_attachment_join ON attachment.ROWID = message_attachment_join.attachment_id
JOIN message ON message_attachment_join.message_id = message.ROWID
JOIN chat_message_join ON message.ROWID = chat_message_join.message_id
JOIN chat ON chat_message_join.chat_id = chat.ROWID
WHERE attachment.mime_type LIKE 'audio/%'
AND chat.chat_identifier LIKE ?
ORDER BY attachment.created_date DESC
"""

cursor.execute(query, (f"%{contact_identifier}%",))
results = cursor.fetchall()

print(f"Found {len(results)} audio messages. Copying to {output_dir}/\n")

def convert_apple_timestamp(timestamp):
    """Convert Apple's Core Data timestamp to datetime"""
    # Apple timestamps are seconds since 2001-01-01
    apple_epoch = datetime(2001, 1, 1)
    return apple_epoch + timedelta(seconds=timestamp)

for row in results:
    file_path = row[0]
    created_date = row[1]
    
    # Handle the tilde and convert to absolute path
    if file_path.startswith('~'):
        file_path = os.path.expanduser(file_path)
    
    # Get original filename and extension
    original_filename = os.path.basename(file_path)
    name, ext = os.path.splitext(original_filename)
    
    # Convert timestamp to readable format
    dt = convert_apple_timestamp(created_date)
    timestamp_str = dt.strftime("%Y%m%d_%H%M%S")
    
    # Create new filename: timestamp_originalname.ext
    new_filename = f"{timestamp_str}_{name}{ext}"
    
    # Check if file exists
    if os.path.exists(file_path):
        # Copy to output directory with new name
        destination = os.path.join(output_dir, new_filename)
        shutil.copy2(file_path, destination)
        print(f"✓ {new_filename}")
    else:
        print(f"✗ {new_filename} (file not found at {file_path})")

conn.close()
print(f"\nDone! {len(results)} files processed.")
