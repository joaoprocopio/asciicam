#![feature(ascii_char)]
#![feature(ascii_char_variants)]

use ab_glyph::{FontRef, PxScale};
use image::{GrayImage, Luma};
use imageproc::drawing::draw_text_mut;
use std::ascii;

fn calculate_brightness(c: char, font: &FontRef, size: f32) -> f32 {
    let scale = PxScale::from(size);
    let mut img = GrayImage::from_pixel(30, 30, Luma([255u8]));
    draw_text_mut(&mut img, Luma([0u8]), 2, 2, scale, font, &c.to_string());
    let total_pixels = (img.width() * img.height()) as f32;
    let dark_pixels: u32 = img.pixels().map(|p| if p[0] < 128 { 1 } else { 0 }).sum();

    1.0 - (dark_pixels as f32 / total_pixels)
}

fn main() {
    let font_bytes =
        include_bytes!("/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Regular.ttf");
    let font = FontRef::try_from_slice(font_bytes).expect("Failed to load font");

    // ASCII printable characters range from 32 to 127.
    // But 32 is Space, and 127 is Delete.
    let mut chars = (32..127)
        .map(|c| unsafe { ascii::Char::from_u8_unchecked(c) })
        .map(|c| (c, calculate_brightness(c.into(), &font, 16.0)))
        .collect::<Vec<(ascii::Char, f32)>>();

    chars.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap());

    let chars = chars.iter().map(|c| c.0).collect::<String>();

    dbg!(chars);
}
