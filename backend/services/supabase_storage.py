import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

def get_supabase_client() -> Client:
    url = os.getenv("SUPABASE_URL", "")
    key = os.getenv("SUPABASE_KEY", "")
    if not url or not key:
        return None
    return create_client(url, key)

def upload_pdf_to_supabase(file_path: str, bucket_name: str = "prescriptions") -> str:
    """
    Uploads a generated PDF file to Supabase Storage and returns its public/signed URL.
    Falls back to local file path if Supabase credentials are not configured.
    """
    if not os.path.exists(file_path):
        return ""

    client = get_supabase_client()
    if not client:
        return file_path

    try:
        file_name = os.path.basename(file_path)
        with open(file_path, "rb") as f:
            file_bytes = f.read()

        # Upload file to bucket
        client.storage.from_(bucket_name).upload(
            file_name,
            file_bytes,
            {"content-type": "application/pdf", "upsert": "true"}
        )

        # Get Public URL
        public_url = client.storage.from_(bucket_name).get_public_url(file_name)
        return public_url
    except Exception as e:
        print(f"[Supabase Storage Upload Error]: {e}")
        return file_path
