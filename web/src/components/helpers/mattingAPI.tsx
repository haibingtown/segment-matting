
import {
    mattingDataProps
  } from "./Interface";

const API_MATTING = "http://127.0.0.1:5000/matting"

const downloadBlob = (blob: any, name: string) => {
    const link = document.createElement("a");
    link.download = name + ".png";
    link.href = URL.createObjectURL(blob);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


const requestMatting = ({
    imageData,
    maskData
}: mattingDataProps)=> {

    const formData = new FormData();
    formData.append('image', imageData, 'image.jpg');
    formData.append('mask', maskData, 'mask.png');

    const segRequest =
     fetch(`${API_MATTING}`, {
          method: "POST",
          body: formData,
        });
    segRequest.then(async (segResponse) => {
        const segResponseBlob = await segResponse.blob();
        downloadBlob(segResponseBlob, "image");
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