
import {
    mattingDataProps
  } from "./Interface";

const API_MATTING = "http://127.0.0.1:5000/mask"

const downloadBlob = (blob: any, name: string) => {
    const link = document.createElement("a");
    link.download = name + ".png";
    link.href = URL.createObjectURL(blob);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

const downloadCanvas = (canvas: any) => {
    // 将 Canvas 内容转换为 data URL
    var dataUrl = canvas.toDataURL();

    // 创建一个下载链接
    var downloadLink = document.createElement('a');
    downloadLink.href = dataUrl;
    downloadLink.download = 'canvas_image.png'; // 设置下载文件名

    // 将下载链接添加到页面
    document.body.appendChild(downloadLink);

    // 模拟点击下载链接
    downloadLink.click();

    // 移除下载链接
    document.body.removeChild(downloadLink);
}

const requestMatting = ({
    image,
    maskData
}: mattingDataProps)=> {

    const formData = new FormData();
    formData.append('mask', maskData, 'mask.png');
    // formData.append('width', image.width)
    // formData.append('height', image.height)

    const segRequest =
     fetch(`${API_MATTING}`, {
          method: "POST",
          body: formData,
        });
    segRequest.then(async (segResponse) => {

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx || !image) return;
        const segResponseBlob = await segResponse.blob();
        // 使用 URL.createObjectURL 将 Blob 转换为 URL
        var blobURL = URL.createObjectURL(segResponseBlob);
        // 创建一个 Image 对象
        var mask = new Image();
        // 设置 Image 对象的 src 为 Blob 转换的 URL
        mask.src = blobURL;

        // 在图像加载完成后，将图像绘制到 Canvas 上
        mask.onload = function() {
            // 设置 Canvas 尺寸与图像相同
            canvas.width = mask.width;
            canvas.height = mask.height;
            // 在临时Canvas上绘制遮罩图像
            ctx.drawImage(mask, 0, 0, mask.width, mask.height);
            // 获取遮罩图像的像素数据
            var maskImageData = ctx.getImageData(0, 0, mask.width, mask.height);

            /**
             * 合并mask与处理后的原始图
             */
            ctx.drawImage(image, 0, 0, mask.width, mask.height);
            var resultImageData = ctx.getImageData(0, 0, mask.width, mask.height)
            // 设置 alpha 通道
            for (var i = 0; i < maskImageData.data.length; i += 4) {
                resultImageData.data[i + 3] = maskImageData.data[i]; // 设置 alpha 通道为半透明,注意后端只返回 alpha 通道，因此在数组的第一位
            }

            // 将修改后的图像数据放回 Canvas
            ctx.putImageData(resultImageData, 0, 0);

            // 释放 Blob URL 对象，以释放资源
            URL.revokeObjectURL(blobURL);

            downloadCanvas(canvas)
        };

        // downloadBlob(segResponseBlob, "image");
    //     const segJSON = await segResponse.json();
    //     const blob = segJSON.map((arrStr: string) => {
    //         // const binaryString = window.atob(arrStr);
    //         // // 将 base64 字符串转换为 ArrayBuffer
    //         // const arrayBuffer = Uint8Array.from(binaryString, c => c.charCodeAt(0)).buffer;
    //         // // 创建 Blob 对象
    //         // // const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
    //         // // return blob
    //         const segResponseBlob = await segResponseClone.blob();
    //   downloadBlob(segResponseBlob, imgName);
    //         return arrayBuffer
    //     });

        // downloadBlob(blob, "image")
    });
}



export {requestMatting}