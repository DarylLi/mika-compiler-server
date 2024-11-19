// 将所选目录下的文件内容及目录结构生成json格式对象
const readFromLocalForder = async (curpath, outPutPath, exportEntry) => {
  const fs = require("fs");
  const path = require("path");
  // 假设你有一个包含路径的文件名字符串
  const filePath = `/${curpath}` || "/create-react-demo-tmp";

  // 使用 path.basename 获取文件名
  const dirName = path.basename(filePath);
  console.log(dirName);
  let localFileJSON = [];
  const deepMapFiles = async (dir) => {
    return await new Promise((outRes, outRej) => {
      let fileList = [];
      try {
        fs.readdir(dir, async (err, files) => {
          if (err) {
            console.error(err);
          }
          for (var i = 0; i < files.length; i++) {
            let file = files[i];
            if (!/.git/.test(file)) {
              //   }
              //   files.forEach(async (file) => {
              const curPath = `${dir}/${file}`;
              // console.log("文件：：" + curPath);
              let curFile = {
                filename: "",
                kind: "",
                path: "",
                value: "",
                id: "",
              };
              await new Promise(async (reslove, reject) => {
                fs.stat(curPath, async (err, stats) => {
                  curFile.filename = file;
                  curFile.path = curPath;
                  curFile.id = file + "-" + curPath;
                  if (err) {
                    console.error(err);
                    reject(err);
                  }
                  if (stats.isDirectory()) {
                    curFile.kind = "directory";
                    curFile.children = await deepMapFiles(curPath);
                    reslove("ok");
                  } else {
                    curFile.kind = "file";
                    const readfile = fs.readFileSync(curPath, "utf-8");
                    reslove("ok");
                    curFile.value = readfile;
                  }
                  fileList.push(curFile);
                });
              });
            }
            //   console.log(i === files.length - 1 && outRes(fileList));
            i === files.length - 1 && outRes(fileList);
          }
          //   );
        });
      } catch (error) {
        outRej(error);
      }
    });
  };
  localFileJSON = [
    {
      filename: curpath || "create-react-demo-tmp",
      kind: "directory",
      path: curpath || "create-react-demo-tmp",
      id: curpath || "create-react-demo-tmp",
    },
  ];
  localFileJSON[0].children = await deepMapFiles(dirName);
  //   console.log("children load finish", localFileJSON);
  fs.writeFileSync(
    `${outPutPath}.js`,
    // `module.exports = {createReactDemo:${JSON.stringify(localFileJSON)}}`,
    `module.exports = {${exportEntry}:${JSON.stringify(localFileJSON)}}`,
    {}
  );
};

const curFilePath = process.argv[2];
const outPutPath = process.argv[3];
const exportEntry = process.argv[4];

readFromLocalForder(curFilePath, outPutPath, exportEntry);
// console.log(curFilePath, outPutPath);
