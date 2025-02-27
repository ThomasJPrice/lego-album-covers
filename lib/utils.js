import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { COLOUR_PALETTE } from "./constants";
import convert from 'color-convert';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function processAlbumCover(image, size, setGrid) {
  // Resize
  const img = new Image();
  img.src = image;
  img.crossOrigin = "anonymous";
  img.onload = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = size;
    canvas.height = size;
    ctx.drawImage(img, 0, 0, size, size);
    const imageData = ctx.getImageData(0, 0, size, size).data; // Gives array of rgba values

    // Process
    const grid = [];
    for (let i = 0; i < imageData.length; i += 4) {
      const rgb = [imageData[i], imageData[i + 1], imageData[i + 2]];
      grid.push(findClosestColour(rgb));
    }
    
    setGrid(grid);
  };
}

export function findClosestColour(rgb) {
  return COLOUR_PALETTE.reduce((closestColour, currentColour) => {
    const currentLab = hexToLab(currentColour);
    const closestLab = hexToLab(closestColour);
    const targetLab = rgbToLab(rgb);

    // Calculate CIEDE2000 distance between the two colors
    const currentDistance = ciede2000(targetLab, currentLab);
    const closestDistance = ciede2000(targetLab, closestLab);

    return currentDistance < closestDistance ? currentColour : closestColour;
  }, COLOUR_PALETTE[0]);
}

const hexToLab = (hex) => {
  const rgb = hexToRgb(hex);
  return convert.rgb.lab(rgb);
};

const rgbToLab = (rgb) => {
  return convert.rgb.lab(rgb);
};

const ciede2000 = (lab1, lab2) => {
  // Implement CIEDE2000 formula or use a library
  // For simplicity, we'll use Euclidean distance in LAB space here
  const [l1, a1, b1] = lab1;
  const [l2, a2, b2] = lab2;

  return Math.sqrt(
    Math.pow(l1 - l2, 2) + Math.pow(a1 - a2, 2) + Math.pow(b1 - b2, 2)
  );
};

const hexToRgb = (hex) => {
  const bigint = parseInt(hex.slice(1), 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
};