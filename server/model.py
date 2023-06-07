import cv2
from flask import Flask, Response, request, jsonify
from PIL import Image
import numpy as np
import io
import base64
from flask_cors import CORS
from rembg.bg import alpha_matting_cutout,post_process

from segment_anything import SamPredictor, sam_model_registry

import server.matting

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
def matting():
    image = Image.open(request.files['image'])
    mask = Image.open(request.files['mask'])
    mask = mask.convert('L')
    mask = mask.resize(image.size)
    mask = mask.point(lambda p: p > 0 and 255)
    mask = Image.fromarray(post_process(np.array(mask)))
    result = alpha_matting_cutout(image, mask, 240, 10, 20)

    image_stream = io.BytesIO()
    result.save(image_stream, format='png')
    image_stream.seek(0)

    return Response(image_stream, mimetype='image/png')

if __name__ == '__main__':
    app.run()
