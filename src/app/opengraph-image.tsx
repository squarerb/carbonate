import { renderShareImage } from "@/lib/shareImage";

export const runtime = "nodejs";
export const alt = "Carbonate — carbon copies of your text, on demand";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return renderShareImage();
}
