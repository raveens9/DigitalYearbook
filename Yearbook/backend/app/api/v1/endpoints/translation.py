from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from deep_translator import GoogleTranslator

router = APIRouter()

# This defines what data we accept from the Frontend
class TranslationRequest(BaseModel):
    text: str
    target_lang: str  # 'si' (Sinhala), 'ta' (Tamil), or 'en' (English)

@router.post("/translate")
async def translate_text(request: TranslationRequest):
    """
    Translates text into Sinhala, Tamil, or English.
    """
    try:
        # 1. Validate the language code
        valid_langs = ['si', 'ta', 'en']
        if request.target_lang not in valid_langs:
            raise HTTPException(status_code=400, detail="Supported languages: 'si', 'ta', 'en'")

        # 2. Perform the translation
        # We use source='auto' so it detects if the original is English/Sinhala/Tamil automatically
        translator = GoogleTranslator(source='auto', target=request.target_lang)
        translated_text = translator.translate(request.text)

        return {"original": request.text, "translated": translated_text, "lang": request.target_lang}

    except Exception as e:
        print(f"Translation Error: {e}")
        raise HTTPException(status_code=500, detail="Translation service failed. Please try again.")