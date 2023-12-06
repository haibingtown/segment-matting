import cv2
from PIL.Image import Resampling
from flask import Flask, Response, request, jsonify
from PIL import Image, ImageFilter
import numpy as np
import io
import base64
from flask_cors import CORS

from segment_anything import SamPredictor, sam_model_registry

# from matting import matting

app = Flask(__name__)
CORS(app)


def init():
    checkpoint = "model/sam_vit_h_4b8939.pth"
    model_type = "vit_h"
    sam = sam_model_registry[model_type](checkpoint=checkpoint)
    sam.to(device='cpu')
    predictor = SamPredictor(sam)
    return predictor


predictor = init();


@app.route('/', methods=['GET'])
def home():
    return jsonify("OK")


@app.route('/segment_everything_box_model', methods=['POST'])
def process_image():
    image_data = request.data

    pil_image = Image.open(io.BytesIO(image_data))

    np_image = np.array(pil_image)

    predictor.set_image(np_image)

    image_embedding = predictor.get_image_embedding().cpu().numpy()

    result_base64 = base64.b64encode(image_embedding.tobytes()).decode('utf-8')
    result_list = [result_base64]
    return jsonify(result_list)


@app.route('/matting', methods=['POST'])
def process_matting():
    image = Image.open(request.files['image'])
    mask = Image.open(request.files['mask'])
    image = image.resize(mask.size)

    width = image.width
    height = image.height
    ratio = 2
    if width >= 1024:
        ratio = 4

    mask = mask.split()[3]
    mask = mask.resize((width // ratio, height // ratio), Resampling.BICUBIC)
    mask = mask.filter(ImageFilter.SMOOTH)
    # # mask = mask.filter(ImageFilter.SMOOTH)
    mask = mask.resize((width, height),  Resampling.BILINEAR)
    #mask = mask.split()[3]
    #mask = mask.filter(ImageFilter.GaussianBlur(radius=2))
    image.putalpha(mask)

    image_stream = io.BytesIO()
    image.save(image_stream, format='png')
    image_stream.seek(0)

    return Response(image_stream, mimetype='image/png')


if __name__ == '__main__':
    app.run(host='0.0.0.0')
