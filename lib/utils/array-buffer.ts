export function arrayBufferToString(arrayBuffer: ArrayBuffer): string {
    const uint8Array = new Uint8Array(arrayBuffer);
    let resultString = "";

    for (let i = 0; i < uint8Array.length; i++) {
        resultString += String.fromCharCode(uint8Array[i]);
    }
    return resultString;
}

export function concatArrayBuffers(buffer1: ArrayBuffer, buffer2: ArrayBuffer): ArrayBuffer {
    const resultLength = buffer1.byteLength + buffer2.byteLength;
    const resultBuffer = new Uint8Array(resultLength);

    const view1 = new Uint8Array(buffer1);
    const view2 = new Uint8Array(buffer2);

    resultBuffer.set(view1, 0);
    resultBuffer.set(view2, view1.length);

    return resultBuffer.buffer;
}
