#!/usr/bin/env python3
"""
Test script for image upload endpoint
"""
import requests
import json
import sys
from io import BytesIO
from PIL import Image

# Configuration
API_URL = "http://localhost:8000"
TEST_EMAIL = "test@example.com"
TEST_PASSWORD = "testpassword123"

def create_test_image():
    """Create a simple test image in memory"""
    # Create a 200x200 red square
    img = Image.new('RGB', (200, 200), color='red')
    
    # Add some text or pattern to make it unique
    from PIL import ImageDraw
    draw = ImageDraw.Draw(img)
    draw.rectangle([50, 50, 150, 150], fill='blue')
    
    # Save to bytes
    img_bytes = BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    
    return img_bytes

def login():
    """Login and get access token"""
    print("🔐 Logging in...")
    response = requests.post(
        f"{API_URL}/api/v1/auth/login",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
    )
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Login successful!")
        return data["access_token"]
    else:
        print(f"❌ Login failed: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def test_image_upload(access_token):
    """Test image upload endpoint"""
    print("\n📤 Testing image upload...")
    
    # Create test image
    img_bytes = create_test_image()
    
    # Prepare multipart form data
    files = {
        'file': ('test_profile.png', img_bytes, 'image/png')
    }
    data = {
        'image_type': 'profile_picture'
    }
    headers = {
        'Authorization': f'Bearer {access_token}'
    }
    
    # Upload
    response = requests.post(
        f"{API_URL}/api/v1/image",
        files=files,
        data=data,
        headers=headers
    )
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print("✅ Image uploaded successfully!")
        print(f"📊 Response:")
        print(json.dumps(result, indent=2))
        print(f"\n🔗 Image URL: {result.get('public_url')}")
        return result
    else:
        print(f"❌ Upload failed!")
        print(f"Response: {response.text}")
        return None

def main():
    print("🧪 Testing Image Upload Endpoint\n")
    print("=" * 50)
    
    # Step 1: Login
    access_token = login()
    if not access_token:
        print("\n❌ Cannot proceed without authentication")
        sys.exit(1)
    
    # Step 2: Test upload
    result = test_image_upload(access_token)
    
    print("\n" + "=" * 50)
    if result:
        print("✅ All tests passed!")
    else:
        print("❌ Tests failed!")

if __name__ == "__main__":
    main()
