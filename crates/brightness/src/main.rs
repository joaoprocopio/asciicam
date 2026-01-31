#![feature(ascii_char)]
#![feature(ascii_char_variants)]
use std::ascii;

fn main() {
    // ASCII printable characters range from 32 to 127.
    // But 32 is Space, and 127 is Delete.
    let ascii_chars: Vec<ascii::Char> = (32..127)
        .map(|c| unsafe { ascii::Char::from_u8_unchecked(c) })
        .collect();

    dbg!(ascii_chars);
}
