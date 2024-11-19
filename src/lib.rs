use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    alert(&format!("Hello,I'am{}!!", name));
}

fn largest<T: PartialOrd + Copy>(list: &[T]) -> T {
    let mut largest = list[0];

    for &item in list.iter() {
        if item > largest {
            largest = item;
        }
    }

    largest
}
#[wasm_bindgen]
pub fn getMax(list: &[u32]) -> u32 {
    largest(list)
}

// cargo build --target=wasm32-unknown-unknown
// wasm-bindgen target/wasm32-unknown-unknown/debug/wasm_ex.wasm --out-dir ./pkg
