
import { decode, isBlurhashValid } from "blurhash";

export const getBase64FromBlurhash = (blurhash: string, width: number = 128, height: number = 128) => {
    if (!isBlurhashValid(blurhash)) return ''

    const pixels = decode(blurhash, width, height);
    const canvas = document.createElement("canvas");
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d");
    const imageData = ctx?.createImageData(width, height);
    imageData?.data.set(pixels);
    ctx?.putImageData(imageData as ImageData, 0, 0);
    return canvas.toDataURL()
}
