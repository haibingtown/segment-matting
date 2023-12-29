import os

import cv2
from PIL.Image import Resampling
from flask import Flask, Response, request, jsonify, send_file
from PIL import Image, ImageFilter
import numpy as np
import io
import base64
from flask_cors import CORS

from segment_anything import SamPredictor, sam_model_registry

BUILD_DIR = os.environ.get("LAMA_CLEANER_BUILD_DIR", "web/build")
app = Flask(__name__, static_folder=os.path.join(BUILD_DIR, "static"))
CORS(app)


def init():
    checkpoint = "../../model/sam_vit_h_4b8939.pth"
    model_type = "vit_h"
    sam = sam_model_registry[model_type](checkpoint=checkpoint)
    sam.to(device='cpu')
    predictor = SamPredictor(sam)
    return predictor


predictor = init();


@app.route("/")
def index():
    return send_file(os.path.join(BUILD_DIR, "index.html"))


@app.route('/segment_everything_box_model', methods=['POST'])
def process_image():
    image_data = request.data

    pil_image = Image.open(io.BytesIO(image_data))

    # 默认尺寸压缩
    if pil_image.width > 2048 or pil_image.height > 2048:
        pil_image.thumbnail((2048, 2048))

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

@app.route('/mask', methods=['POST'])
def process_mask():
    mask = Image.open(request.files['mask'])
    # 原始尺寸
    width = int(request.form['width'])
    height = int(request.form['height'])

    # 压缩处理
    max_scale = 4096
    if width > max_scale or height > max_scale:
        if width > height:
            height = int(max_scale * height / width)
            width = max_scale
        else:
            width = int(max_scale * width / height)
            height = max_scale

    # 缩放比例
    ratio = 2
    if width > 3072:
        ratio = 12
    elif width > 2048:
        ratio = 8
    elif width > 1024:
        ratio = 4

    mask = mask.split()[3]
    mask = mask.resize((width // ratio, height // ratio), Resampling.BICUBIC)
    mask = mask.filter(ImageFilter.SMOOTH_MORE)
    # # mask = mask.filter(ImageFilter.SMOOTH)
    mask = mask.resize((width, height),  Resampling.BILINEAR)
    mask = mask.point(lambda x: 0 if x < 100 else 255)
    mask = mask.filter(ImageFilter.GaussianBlur(radius=1))

    image_stream = io.BytesIO()
    mask.save(image_stream, format='png')
    image_stream.seek(0)
    return Response(image_stream, mimetype='image/png')

if __name__ == '__main__':
    app.run(host='0.0.0.0',port=5001)
