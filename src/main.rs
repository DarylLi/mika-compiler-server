use core::num;
use js_sys::Number;
use rand::Rng;
use regex::Regex;
use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::ffi::OsStr;
use std::fs::OpenOptions;
use std::io::{BufRead, BufReader};
use std::io::{Error, Read, Write};
use std::{env, fs};

#[derive(Serialize, Deserialize, Debug)]
// base json struct
struct FileInfo {
    filename: String,
    kind: String,
    path: String,
    id: String,
    value: String,
    children: Vec<FileInfo>,
}

// fn main() {
// println!("Searching for {}", parse_config(dirName));
// println!("In file {}", filename);
// check if is static files
fn checkFormat(filepath: &String) -> bool {
    let re: Regex = Regex::new(r".(png|jpg|icon|gif|git)").unwrap();
    let Some(caps) = re.captures(filepath) else {
        return false;
    };
    true
}
/**
 *  获取文件列表
 *  innerPath: 根目录地址
 *  curDir: 文件名||目录名
 */
fn getFileList(innerPath: &str, curDir: String) -> Vec<FileInfo> {
    // println!("reading:\n{}", innerPath);
    // let mut FileList: Vec<FileInfo> = Vec::new();
    let mut ChildrenList: Vec<FileInfo> = Vec::new();
    let cur_path = innerPath;
    let mut cur_dir = curDir;
    // read dir path
    for item in fs::read_dir(cur_path).unwrap() {
        let inner: std::path::PathBuf = item.unwrap().path();
        let entry = &inner;
        let stringPath = entry.display().to_string();
        let innerPath: String = entry.display().to_string();
        let file_name = inner.file_name().and_then(OsStr::to_str).unwrap();
        // let entry = i.unwrap().path()
        let mut contents: String = String::from("");
        let mut curKind: String = String::from("");
        let mut curChildren: Vec<FileInfo> = Vec::new();
        // if is dir do loop
        if entry.is_dir() {
            curKind = String::from("directory");
            contents = String::from("");
            curChildren = getFileList(&stringPath, String::from(file_name));
        } else {
            curKind = String::from("file");
            let isOtherFile = checkFormat(&stringPath);
            // println!("is otherfiles:\n{}", pos);
            // generate context
            if isOtherFile {
                let file = fs::File::open(stringPath).expect("无法打开文件");
                // bufferreader handler image file
                let reader = BufReader::new(file);
                let mut result: String = String::from("");
                for line in reader.lines() {
                    if let Ok(line) = line {
                        result.push_str(&line);
                    }
                }
                // println!("extraFileContext::{}", result);
                contents = result;
                // .expect("Something went wrong reading the file");
            } else {
                contents =
                    fs::read_to_string(stringPath).expect("Something went wrong reading the file");
            }
        }
        let mut innerPath: String = cur_dir.clone();
        innerPath.push_str("/");
        innerPath.push_str(file_name);
        // current path object
        let iteratorInfo: FileInfo = FileInfo {
            filename: String::from(file_name),
            kind: curKind,
            // path: String::from(file_name),
            path: innerPath,
            id: String::from(file_name),
            value: contents,
            children: curChildren,
        };
        ChildrenList.push(iteratorInfo);
    }

    // FileList.push(RootInfo);

    ChildrenList
}

/**
 *  生成json文件
 *  generateMainKey: 生成目录名称
 *  entryFilePath: ./导入目录相对路径
 *  outputFileName: 导出文件名
 */
pub fn generateJsonFile(generateMainKey: &str, entryFilePath: &str, outputFileName: &str) {
    let outputDir = FileInfo {
        filename: String::from(generateMainKey),
        kind: String::from("directory"),
        path: String::from(generateMainKey),
        id: String::from(generateMainKey),
        value: String::from(""),
        children: getFileList(entryFilePath, String::from(generateMainKey)),
    };
    let mut output_vec: Vec<FileInfo> = Vec::new();
    output_vec.push(outputDir);
    //format object to json string
    let serialized = serde_json::to_string(&output_vec).unwrap();
    let mut outPutModule = String::from("");
    outPutModule.push_str("module.exports = {rustUmi:");
    outPutModule.push_str(&serialized);
    outPutModule.push_str("}");
    // "module.exports = {" + serialized + "}";
    // generate output json file
    let writeFile = fs::File::create(outputFileName).unwrap();

    let mut file = OpenOptions::new()
        .write(true)
        .open(outputFileName)
        .expect("Could not open file");

    file.write_all(outPutModule.as_bytes());
}
pub fn getrandomcards(count: i32, cards: Vec<i32>) -> Vec<i32> {
    let mut result_count: Vec<i32> = Vec::new();
    for number in cards.iter() {
        let secret_number = rand::thread_rng().gen_range(0..17);
        result_count.push(secret_number);
    }
    let origin_length = result_count.len();
    let nums: Vec<_> = result_count
        .into_iter()
        .collect::<HashSet<_>>()
        .into_iter()
        .collect();
    let nums_length = nums.len();
    println!("length:{}==={}", nums_length, origin_length);
    let mut current_result: Vec<i32> = Vec::new();
    if origin_length == nums_length {
        current_result = nums;
    } else {
        current_result = getrandomcards(count, cards)
    }
    current_result
    // console.log(resultCount,Array.from(new Set(resultCount)).length===resultCount.length)
    // if(resultCount.length === Array.from(new Set(resultCount)).length){
    //   return resultCount.map((e)=>({...cards[e]}))
    // }
    // else return randomOrder(count, cards)
}

fn main() {
    let mut arg_list = Vec::new();
    for argument in env::args() {
        println!("{argument}");
        arg_list.push(argument)
    }
    let mainKey = &arg_list[1];
    let entryDir: &String = &arg_list[2];
    let outPutDir: &String = &arg_list[3];
    println!("the whole args{},{},{}", mainKey, entryDir, outPutDir);
    // generateJsonFile("rust-umi-generate", "./react-umi", "okok.js");
    generateJsonFile(mainKey, entryDir, outPutDir);
    // let count = 17;
    // let mut card_list = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

    // let result_cards = getrandomcards(count, card_list);
    // for number in result_cards.iter() {
    //     println!("{}", number);
    // }
}
