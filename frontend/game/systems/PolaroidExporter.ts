export async function composePolaroidCard(options: {
  rawCanvasDataUrl: string;
  quote: string;
  moodLabel: string;
  nickname: string;
}): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const cardWidth = 960;
      const cardHeight = 760;
      const canvas = document.createElement('canvas');
      canvas.width = cardWidth;
      canvas.height = cardHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(options.rawCanvasDataUrl);
        return;
      }

      // Warm cream Polaroid paper background
      ctx.fillStyle = '#fbf7f0';
      ctx.fillRect(0, 0, cardWidth, cardHeight);

      // Subtle paper border
      ctx.strokeStyle = '#e6dccf';
      ctx.lineWidth = 4;
      ctx.strokeRect(14, 14, cardWidth - 28, cardHeight - 28);

      // Draw game scene snapshot inside frame
      const photoX = 44;
      const photoY = 44;
      const photoW = cardWidth - 88;
      const photoH = 520;

      ctx.save();
      ctx.fillStyle = '#181412';
      ctx.fillRect(photoX, photoY, photoW, photoH);
      ctx.drawImage(img, photoX, photoY, photoW, photoH);
      ctx.restore();

      // Inner photo vignette border
      ctx.strokeStyle = 'rgba(42, 31, 24, 0.18)';
      ctx.lineWidth = 2;
      ctx.strokeRect(photoX, photoY, photoW, photoH);

      // Timestamp badge in top-left of photo
      const now = new Date();
      const timeStr = now.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      });
      ctx.fillStyle = 'rgba(20, 16, 14, 0.76)';
      ctx.fillRect(photoX + 18, photoY + 18, 195, 36);
      ctx.fillStyle = '#f8e3c4';
      ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`☕ 24h Café • ${timeStr}`, photoX + 32, photoY + 41);

      // Bottom Polaroid Caption Area
      ctx.fillStyle = '#2d221b';
      ctx.font = 'italic 600 22px "Fraunces", Georgia, serif';
      const cleanQuote = `"${(options.quote || 'Có những ngày chỉ muốn ngồi yên trong một quán cà phê.').slice(0, 92)}"`;
      ctx.fillText(cleanQuote, photoX + 4, photoY + photoH + 56);

      // Mood & Nickname
      ctx.fillStyle = '#6f5b4c';
      ctx.font = '500 16px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(
        `${options.nickname}  •  Tâm trạng: ${options.moodLabel}`,
        photoX + 4,
        photoY + photoH + 95,
      );

      // Right-aligned brand URL for viral sharing (Section 8.2)
      ctx.textAlign = 'right';
      ctx.fillStyle = '#9c7a54';
      ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('24hcafe.online — A little place to slow down', cardWidth - 48, photoY + photoH + 95);

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(options.rawCanvasDataUrl);
    img.src = options.rawCanvasDataUrl;
  });
}

