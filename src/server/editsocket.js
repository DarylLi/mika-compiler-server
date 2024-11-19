var app = require("express")();
var http = require("http").Server(app);
const fs = require("fs");
const { exec, spawn } = require("child_process");
const template = require("./mock");
// create-react-demo
const crdTemplate = require("./crd");
// umi-demo
const umiRustTemplate = require("./rustUmiGenerate");
const FeTemplate = {
  ...template,
  ...crdTemplate,
  ...umiRustTemplate,
};
// {REACT_TEMPLATE, VUE_TEMPLATE, VANILLA_TEMPLATE}

let curFileTree = "VANILLA_TEMPLATE";
let dirTargetRoot = "public/editorTarget";

const rewriteFile = (info) => {
  return new Promise((resolve, reject) => {
    let resultPath = "";
    const circleTrav = (file, path) => {
      let curPath = path;
      if (file && file.length > 0) {
        for (var i = 0; i < file.length; i++) {
          if (file[i]?.id && info.data?.id && file[i].id === info.data.id) {
            resultPath = curPath + "/" + file[i].filename;
          } else if (file[i].children) {
            circleTrav(file[i].children, curPath + "/" + file[i].filename);
          }
        }
      }
    };
    circleTrav(FeTemplate[curFileTree], `${dirTargetRoot}/${curFileTree}`);
    fs.writeFile(resultPath, info.newcode, async function (err) {
      if (!err) {
        // setTimeout(() => {
        //   resolve("do build");
        //   console.log("okokok yarn build");
        // }, 5000);
        await new Promise((res, rej) => {
          const childInstall = exec(
            `cd ${dirTargetRoot}/${curFileTree}/${
              FeTemplate[curFileTree]?.[0]?.filename || "react"
            } && yarn`,
            { shell: true }
          );
          childInstall.stderr.on("data", function (data) {
            console.error("install_error:", data.toString());
            io.emit("compileInfo", {
              status: "warn",
              msg: data.toString(),
            });
          });
          childInstall.stdout.on("data", function (data) {
            console.log("install_info:", data.toString());
            io.emit("compileInfo", {
              status: "info",
              msg: data.toString(),
            });
          });
          childInstall.stdout.pipe(childInstall.stdout);
          childInstall.on("exit", () => {
            console.log("install_exit: yarn finish");
            io.emit("compileInfo", {
              status: "info",
              msg: `install_exit: yarn finish`,
            });
            res("install finish");
            // process.exit()
          });
          console.log("okokok yarn intall");
        });
        await new Promise((res, rej) => {
          // setTimeout(() => {
          //   res("do build");
          // }, 3000);
          const buildProcess = exec(
            `cd ${dirTargetRoot}/${curFileTree}/${
              FeTemplate[curFileTree]?.[0]?.filename || "react"
            } && yarn build`,
            {
              shell: true,
            }
          );
          buildProcess.stderr.on("data", function (data) {
            console.error("build_error:", data.toString());
            io.emit("compileInfo", {
              status: "warn",
              msg: data.toString(),
            });
            // error Command failed with exit code 1
          });
          buildProcess.stdout.on("data", function (data) {
            console.log("build_info:", data.toString());
            io.emit("compileInfo", {
              status: "info",
              msg: data.toString(),
            });
          });
          buildProcess.stdout.pipe(buildProcess.stdout);
          buildProcess.on("exit", () => {
            io.emit("compileInfo", {
              status: "done",
              msg: `build_exit: 文件重写成功`,
            });
            console.log("build_exit: 文件重写成功");
            resolve("build finish");
          });
        });
      } else reject("error");
    });
  });
};

// test other template
const TestWriteBuild = async (curDir = "create-react-demo-tmp") => {
  let curFileTree = "createReactDemo";
  let FeTemplate = require("./crd");
  console.log(FeTemplate[curFileTree]);
  let dirTargetRoot = "public/editorTarget";
  const generateDirFile = async (arr, path) => {
    if (arr.length > 0) {
      for (var i = 0; i < arr.length; i++) {
        if (!arr[i].value && arr[i].filename) {
          await new Promise((res, rej) => {
            exec(
              `mkdir ${path ? path + "/" : ""}${arr[i].filename}`,
              (err, std, sto) => {
                res("ok");
              }
            );
          });
        } else if (arr[i].value && arr[i].filename) {
          await new Promise((res, rej) => {
            fs.writeFile(
              `${path ? path + "/" : ""}${arr[i].filename}`,
              arr[i].value,
              function (err) {
                if (!err) {
                  res("ok");
                }
              }
            );
          });
        }
        let curPath = path + "/" + arr[i].filename;
        arr[i].children && (await generateDirFile(arr[i].children, curPath));
      }
    }
  };
  return new Promise(async (res, rej) => {
    console.log(fs.existsSync(`${dirTargetRoot}`));
    await new Promise((res, rej) => {
      fs.existsSync(`${dirTargetRoot}`)
        ? exec(`mkdir ${dirTargetRoot}/${curDir}`, (err, std, sto) => {
            res("ok");
          })
        : exec(
            `mkdir ${dirTargetRoot} && mkdir ${dirTargetRoot}/${curDir}`,
            (err, std, sto) => {
              res("ok");
            }
          );
    });
    try {
      await generateDirFile(
        FeTemplate[curFileTree],
        `${dirTargetRoot}/${curDir}`
      );
      await new Promise((resolve, rej) => {
        const childInstall = exec(
          `cd ${dirTargetRoot}/${curDir}/${
            FeTemplate[curFileTree]?.[0]?.filename || "react"
          } && yarn`,
          (error, stdout, stderr) => {
            if (error) {
              console.error(`exec yarn error: ${error}`);
              return;
            }
            console.log(`exec yarn install stdout: ${stdout}`);
            console.error(`exec yarn install stderr: ${stderr}`);
          }
        );
        childInstall.stdout.pipe(childInstall.stdout);
        childInstall.on("exit", () => {
          console.log("yarn finish");
          resolve("install finish");
          // process.exit()
        });
        console.log("okokok yarn intall");
      });
      await new Promise((resolve, rej) => {
        setTimeout(() => {
          resolve("do build");
          console.log("okokok yarn build");
        }, 5000);
        const childInstall = exec(
          `cd ${dirTargetRoot}/${curDir}/${
            FeTemplate[curFileTree]?.[0]?.filename || "react"
          } && yarn build`,
          (error, stdout, stderr) => {
            if (error) {
              console.error(`exec yarn build error: ${error}`);
            }
            console.log(`exec yarn build stdout: ${stdout}`);
            console.error(`exec yarn build stderr: ${stderr}`);
          }
        );
        childInstall.stdout.pipe(childInstall.stdout);
        childInstall.on("exit", () => {
          console.log("yarn build start");
          // resolve('build finish')
        });
      });
      res("done");
    } catch (error) {
      rej(error);
    }
  });
};

// publish build resouses
const readAndBuild = async (curDir = curFileTree) => {
  const generateDirFile = async (arr, path) => {
    if (arr.length > 0) {
      for (var i = 0; i < arr.length; i++) {
        // if (!arr[i].value && arr[i].filename) {
        if (arr[i].kind === "directory") {
          await new Promise((res, rej) => {
            exec(
              `mkdir ${path ? path + "/" : ""}${arr[i].filename}`,
              (err, std, sto) => {
                res("ok");
              }
            );
          });
          // } else if (arr[i].value && arr[i].filename) {
        } else if (arr[i].kind === "file") {
          await new Promise((res, rej) => {
            fs.writeFile(
              `${path ? path + "/" : ""}${arr[i].filename}`,
              arr[i].value,
              function (err) {
                if (!err) {
                  res("ok");
                }
              }
            );
          });
        }
        let curPath = path + "/" + arr[i].filename;
        arr[i].children && (await generateDirFile(arr[i].children, curPath));
      }
    }
  };
  return new Promise(async (res, rej) => {
    console.log(fs.existsSync(`${dirTargetRoot}`));
    await new Promise((res, rej) => {
      fs.existsSync(`${dirTargetRoot}`)
        ? exec(`mkdir ${dirTargetRoot}/${curDir}`, (err, std, sto) => {
            res("ok");
          })
        : exec(
            `mkdir ${dirTargetRoot} && mkdir ${dirTargetRoot}/${curDir}`,
            (err, std, sto) => {
              res("ok");
            }
          );
    });
    try {
      await generateDirFile(
        FeTemplate[curFileTree],
        `${dirTargetRoot}/${curDir}`
      );
      await new Promise((resolve, rej) => {
        const childInstall = spawn(
          `cd ${dirTargetRoot}/${curDir}/${
            FeTemplate[curFileTree]?.[0]?.filename || "react"
          } && yarn`,
          { shell: true }
        );
        childInstall.stderr.on("data", function (data) {
          console.error("install_error:", data.toString());
          io.emit("compileInfo", {
            status: "warn",
            msg: data.toString(),
          });
        });
        childInstall.stdout.on("data", function (data) {
          console.log("install_info:", data.toString());
          io.emit("compileInfo", {
            status: "info",
            msg: data.toString(),
          });
        });
        // const childInstall = exec(
        //   `cd ${dirTargetRoot}/${curDir}/${
        //     FeTemplate[curFileTree]?.[0]?.filename || "react"
        //   } && yarn`,
        //   (error, stdout, stderr) => {
        //     if (error) {
        //       console.error(`exec yarn error: ${error}`);
        //       return;
        //     }
        //     console.log(`exec yarn install stdout: ${stdout}`);
        //     console.error(`exec yarn install stderr: ${stderr}`);
        //   }
        // );
        childInstall.stdout.pipe(childInstall.stdout);
        childInstall.on("exit", () => {
          console.log("install_exit: yarn finish");
          io.emit("compileInfo", {
            status: "done",
            msg: `install_exit: yarn finish`,
          });
          resolve("install finish");
          // process.exit()
        });
        console.log("okokok yarn intall");
      });
      await new Promise((resolve, rej) => {
        // setTimeout(() => {
        //   resolve("do build");
        //   console.log("okokok yarn build");
        // }, 5000);
        const childBuildProcess = spawn(
          `cd ${dirTargetRoot}/${curDir}/${
            FeTemplate[curFileTree]?.[0]?.filename || "react"
          } && yarn build`,
          { shell: true }
        );
        // const childInstall = exec(
        //   `cd ${dirTargetRoot}/${curDir}/${
        //     FeTemplate[curFileTree]?.[0]?.filename || "react"
        //   } && yarn build`,
        //   (error, stdout, stderr) => {
        //     if (error) {
        //       console.error(`exec yarn build error: ${error}`);
        //     }
        //     console.log(`exec yarn build stdout: ${stdout}`);
        //     console.error(`exec yarn build stderr: ${stderr}`);
        //   }
        // );
        childBuildProcess.stderr.on("data", function (data) {
          console.error("build_error:", data.toString());
          io.emit("compileInfo", {
            status: "warn",
            msg: data.toString(),
          });
        });
        childBuildProcess.stdout.on("data", function (data) {
          console.log("build_info:", data.toString());
          io.emit("compileInfo", {
            status: "info",
            msg: data.toString(),
          });
        });
        childBuildProcess.stdout.pipe(childBuildProcess.stdout);
        childBuildProcess.on("exit", () => {
          console.log("build_exit: yarn build filnish！！！");
          io.emit("compileInfo", {
            status: "done",
            msg: `build_exit: yarn build filnish！！！`,
          });
          resolve("build finish");
        });
      });
      res("done");
    } catch (error) {
      rej(error);
    }
  });
};

// publish by devserver(abort version replace by build)
const readAndCmp = async (curDir = curFileTree) => {
  const generateDirFile = async (arr, path) => {
    if (arr.length > 0) {
      for (var i = 0; i < arr.length; i++) {
        // if (!arr[i].value && arr[i].filename) {
        if (arr[i].kind === "directory") {
          await new Promise((res, rej) => {
            exec(
              `mkdir ${path ? path + "/" : ""}${arr[i].filename}`,
              (err, std, sto) => {
                res("ok");
              }
            );
          });
          // } else if (arr[i].value && arr[i].filename) {
        } else if (arr[i].kind === "file") {
          await new Promise((res, rej) => {
            // fs.appendFile(`${path?(path+'/'):''}${arr[i].filename}`, (arr[i].value),function(err){
            fs.writeFile(
              `${path ? path + "/" : ""}${arr[i].filename}`,
              arr[i].value,
              function (err) {
                if (!err) {
                  //console.log('文件写入完毕');
                  res("ok");
                }
              }
            );
          });
        }
        let curPath = path + "/" + arr[i].filename;
        arr[i].children && (await generateDirFile(arr[i].children, curPath));
      }
    }
  };
  return new Promise(async (res, rej) => {
    console.log(curDir);
    await new Promise((res, rej) => {
      exec(
        `mkdir ${dirTargetRoot} && mkdir ${dirTargetRoot}/${curDir}`,
        (err, std, sto) => {
          res("ok");
        }
      );
    });
    try {
      await generateDirFile(
        FeTemplate[curFileTree],
        `${dirTargetRoot}/${curDir}`
      );
      await new Promise((resolve, rej) => {
        const childInstall = exec(
          `cd ${dirTargetRoot}/${curDir}/${
            FeTemplate[curFileTree]?.[0]?.filename || "react"
          } && yarn`,
          (error, stdout, stderr) => {
            if (error) {
              console.error(`exec yarn error: ${error}`);
              return;
            }
            console.log(`exec yarn install stdout: ${stdout}`);
            console.error(`exec yarn install stderr: ${stderr}`);
          }
        );
        childInstall.stdout.pipe(childInstall.stdout);
        childInstall.on("exit", () => {
          console.log("yarn finish");
          resolve("install finish");
          // process.exit()
        });
        console.log("okokok yarn intall");
      });
      await new Promise((resolve, rej) => {
        setTimeout(() => {
          resolve("dadada");
          console.log("okokok yarn start");
        }, 3000);
        const childInstall = exec(
          `cd ${dirTargetRoot}/${curDir}/${
            FeTemplate[curFileTree]?.[0]?.filename || "react"
          } && yarn start`,
          (error, stdout, stderr) => {
            if (error) {
              console.error(`exec yarn error: ${error}`);
              return;
            }
            console.log(`exec yarn dev stdout: ${stdout}`);
            console.error(`exec yarn dev stderr: ${stderr}`);
          }
        );
        childInstall.stdout.pipe(childInstall.stdout);
        childInstall.on("exit", () => {
          console.log("yarn dev finish");
          resolve("dev finish");
          // process.exit()
        });
      });
      res("done");

      // exec(`cd target/react && yarn && yarn build`, (error, stdout, stderr) => {
      // const child = exec(`cd target/react && yarn && yarn dev`, (error, stdout, stderr) => {
      //     // exec(`curl GET https://3d.nicovideo.jp/search?category=original${(page&&page!=1)?`&page=${page}`:''}`, (error, stdout, stderr) => {
      //         if (error) {
      //         console.error(`执行出错: ${error}`);
      //         return;
      //         }
      //         console.log('stdout =', stdout)
      //         console.log('stderr =', stderr)
      //         console.log('wrrrrrry')
      //         // writeMMDJSON();
      //        res('done')
      //     });

      // const child = exec(`cd target/react && yarn && yarn dev`, (error, stdout, stderr) => {
      // // exec(`curl GET https://3d.nicovideo.jp/search?category=original${(page&&page!=1)?`&page=${page}`:''}`, (error, stdout, stderr) => {
      // 	if (error) {
      // 	console.error(`执行出错: ${error}`);
      // 	return;
      // 	}
      // 	console.log('stdout =', stdout)
      // 	console.log('stderr =', stderr)
      // 	console.log('wrrrrrry')
      // 	// writeMMDJSON();
      //    res('done')
      // });
    } catch (error) {
      rej(error);
    }
  });
};

// 读取上传文件夹
const readFromLocalForder = async () => {
  const fs = require("fs");
  const path = require("path");
  // 假设你有一个包含路径的文件名字符串
  const filePath = "/create-react-demo-tmp";

  // 使用 path.basename 获取文件名
  const dirName = path.basename(filePath);
  let localFileJSON = [];
  const deepMapFiles = async (dir) => {
    return await new Promise((ress, rejj) => {
      let fileList = [];
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
          //   console.log(i === files.length - 1 && ress(fileList));
          i === files.length - 1 && ress(fileList);
        }
        //   );
      });
    });
  };
  localFileJSON = [
    {
      filename: "create-react-demo-tmp",
      kind: "directory",
      path: "create-react-demo-tmp",
      id: "create-react-demo-tmp",
    },
  ];
  localFileJSON[0].children = await deepMapFiles(dirName);
  //   console.log("children load finish", localFileJSON);
  fs.writeFileSync(
    `crd.js`,
    `module.exports = {createReactDemo:${JSON.stringify(localFileJSON)}}`,
    {}
  );
  //   console.log(JSON.stringify(localFileJSON));

  //   fs.stat("create-react-demo-tmp/README.md", (err, stats) => {
  //     if (err) {
  //       console.error("发生错误:", err);
  //       return;
  //     }
  //     if (stats.isDirectory()) {
  //       console.log("这是一个文件夹");
  //     } else {
  //       console.log("这不是一个文件夹");
  //     }
  //   });
};

var io = require("socket.io")(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.get("/", function (req, res) {
  res.send(`<div style='background:"#dedede"'>wawawa</div>`);
});
io.on("connection", function (socket) {
  // readFromLocalForder();

  // TestWriteBuild();

  console.info("server receive: a user connect");
  socket.on("disconnect", function () {
    console.log("server receive: a user connected");
  });
  socket.on("updateCode", async function (obj) {
    try {
      await rewriteFile(obj);
    } catch (error) {
      console.log(error);
      //res.status(200).send('something went wrong...');
    }
    io.emit("fromserver", {
      status: "done",
      msg: "复写成功！",
      rewrite: true,
      ...obj,
    });
  });
  socket.on("initProject", async function (obj) {
    try {
      // initProject//
      curFileTree = obj.tmp;
      // await readAndCmp();
      await readAndBuild();
    } catch (error) {
      console.log(error);
      //res.status(200).send('something went wrong...');
    }
    io.emit("fromserver", {
      status: "done",
      msg: "编译中。。请刷新页面",
      ...obj,
    });
  });
});

const getRustExe = (generateMainKey, entryFilePath, outputFileName) => {
  const getStart = spawn(
    `cargo run ${generateMainKey} ${entryFilePath} ${outputFileName}`,
    { shell: true }
  );
  getStart.stderr.on("data", function (data) {
    console.error("rust run error:", data.toString());
  });
  getStart.stdout.on("data", function (data) {
    console.log("rust run ok:", data.toString());
  });
  getStart.on("exit", () => {
    console.log("rust execute done");
    // process.exit()
  });
};
http.listen(3000, function () {
  console.log("listening on 3000");
  getRustExe("rust-umi-generate", "./react-umi", "./src/server/outputJson.js");
  // const childInstall = spawn(`cd .. && cd ..`, { shell: true });
  // childInstall.stderr.on("data", function (data) {
  //   console.error("input rust error:", data.toString());
  // });
  // childInstall.stdout.on("data", function (data) {
  //   console.log("input rust ok:", data.toString());
  // });
  // childInstall.on("exit", () => {
  //   console.log("rust entry finish");
  //   getRustExe(
  //     "rust-umi-generate",
  //     "./react-umi",
  //     "./src/server/outputJson.js"
  //   );
  //   // process.exit()
  // });
});
