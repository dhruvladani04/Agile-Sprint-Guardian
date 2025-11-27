import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

def list_models():
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        print("GOOGLE_API_KEY not found.")
        return

    client = genai.Client(api_key=api_key)
    try:
        # The SDK might have a different way to list models, checking documentation or trying standard method
        # Assuming client.models.list() exists based on standard patterns
        for model in client.models.list():
            print(f"Model: {model.name}")
            print(f"  DisplayName: {model.display_name}")
            print(f"  SupportedGenerationMethods: {model.supported_generation_methods}")
            print("-" * 20)
    except Exception as e:
        print(f"Error listing models: {e}")

if __name__ == "__main__":
    list_models()
