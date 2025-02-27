export function createImageOverlay(currentImage: string, previousImage: string): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context not available");

    const img1 = new Image();
    const img2 = new Image();
    
    img1.onload = () => {
      canvas.width = img1.width;
      canvas.height = img1.height;
      ctx.globalAlpha = 0.5;
      ctx.drawImage(img1, 0, 0);
      
      img2.onload = () => {
        ctx.drawImage(img2, 0, 0);
        resolve(canvas.toDataURL());
      };
      img2.src = previousImage;
    };
    img1.src = currentImage;
  });
}
