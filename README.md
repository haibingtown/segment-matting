# Segment Matting

Segment Matting is a project aimed at improving the quality and performance of image matting using the SAM (Segment Anything Model) model. It focuses on optimizing the matting process to reduce jagged edges and improve the overall accuracy of the segmentation. This project integrates the capabilities of [segment-anything.com](https://segment-anything.com) and leverages the resources provided by the [meta-sam-demo](https://github.com/MiscellaneousStuff/meta-sam-demo) repository.

## Overview

The Segment Matting project combines the power of the SAM model and the user-friendly interface of segment-anything.com to provide an efficient and accurate solution for image matting. The main objectives of this project are:

- Improve the quality of matting results by reducing jagged edges and improving the smoothness of the segmentation.
- Optimize the performance of the matting process to achieve faster and more efficient results.
- Provide a user-friendly interface for easy interaction and seamless integration with other applications.

## Getting Started
To get started with the Segment Matting project, follow these steps:

1. Clone the [segment-matting](https://github.com/haibingtown/segment-matting) repository to your local machine.
```shell
   $ git clone https://github.com/haibingtown/segment-matting.git
```
2. Start the Backend
- Navigate to the server directory and install the required dependencies:

```shell
    $ cd server
    $ pip install -r requirements.txt
```
- Run the model.py file to start the backend:
```shell
    $ python model.py
```
3. Start the Frontend
- Navigate to the web directory and install the required dependencies:
```shell
    $ cd web
    $ npm i
```
- Start the frontend development server:
```shell
    $ npm start
```
4. Access the Application
Open your web browser and visit http://localhost:3000/ to access the project. You will see as below, then just click Upload button.

![img.png](server/assets/img.png)

## Matting

|         | Mask                                | Result 2                                   |
|---------|-------------------------------------|--------------------------------------------|
| Image 1 | ![Mask 1](server/assets/3_mask.png) | ![Result 2](server/assets/3_mat_alpha.png) |
| Image 2 | ![Mask 1](server/assets/4_mask.png) | ![Result 2](server/assets/4_mat_alpha.png) |


## Export ONNX
todo
## Contributing

Contributions to the Segment Matting project are welcome. 

## License

This project is licensed under the [MIT License](https://github.com/MiscellaneousStuff/meta-sam-demo/blob/main/LICENSE). Please see the LICENSE file for more details.

## Acknowledgements

We would like to express our gratitude to the developers of the SAM model and the segment-anything.com platform for their valuable contributions to the field of image matting.


