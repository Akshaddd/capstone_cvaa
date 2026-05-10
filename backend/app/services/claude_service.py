import anthropic
import base64
from PIL import Image
import io

client = anthropic.Anthropic()

def encode_image(image: Image.Image) -> str:
    buffer = io.BytesIO()
    image.save(buffer, format="JPEG")
    return base64.standard_b64encode(buffer.getvalue()).decode("utf-8")

def analyse_image_with_claude(image: Image.Image, yolo_detections: list) -> str:
    image_data = encode_image(image)

    detection_summary = ", ".join(
        [f"{d.get('class')} ({round(d.get('confidence', 0) * 100)}% confidence)"
         for d in yolo_detections]
    ) or "none"

    prompt = f"""You are an accessibility compliance expert assessing public transport infrastructure against the Disability Standards for Accessible Public Transport (DSAPT) in Australia.

A computer vision model has detected the following accessibility features in the uploaded image: {detection_summary}.

Based on the image and these detections, provide a concise professional accessibility assessment that includes:
1. A brief description of what is visible in the image
2. Assessment of detected accessibility features and their adequacy
3. Any potential accessibility barriers or concerns not captured by the detections
4. Overall compliance likelihood with DSAPT standards

Keep the response under 200 words and use plain professional language."""

    message = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=512,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/jpeg",
                            "data": image_data,
                        },
                    },
                    {
                        "type": "text",
                        "text": prompt
                    }
                ],
            }
        ],
    )

    return message.content[0].text
