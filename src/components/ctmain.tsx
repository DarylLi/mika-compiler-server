import React, { useState, useEffect, useRef } from "react";
import MonacoEditor from "react-monaco-editor";
import { editStore } from "@store/index";
import { observer } from "mobx-react-lite";
import { io } from "@utils/socket-client";
import { AnyObject } from "antd/es/_util/type";

function MainEditor() {
  // let cursocket: any = null;
  const [code, setCode] = useState("");
  const cursocket: any = useRef(null);
  // const [cursocket, setCurSocket] = useState(null as any);
  const editorDidMount = (editor: any, monaco: any) => {
    editor.focus();
  };
  const onChange = (newValue: any, e: any) => {
    editStore.updateCode(newValue || "");
  };
  function lineNumbersFunc(originalLineNumber: any) {
    var map: any = [
      "O",
      "I",
      "II",
      "III",
      "IV",
      "V",
      "VI",
      "VII",
      "VIII",
      "IX",
      "X",
    ];
    if (originalLineNumber < map.length) {
      return map[originalLineNumber];
    }
    return originalLineNumber;
  }
  const options = {
    selectOnLineNumbers: true,
    lineNumbers: lineNumbersFunc,
  };

  // useEffect(() => {
  //   if (!code) {
  //     setCode("666");
  //     // cursocket = io("http://127.0.0.1:3000");
  //     let curSt = io("http://127.0.0.1:3000");
  //     setCurSocket(curSt);
  //   }

  //   if (code) {
  //     console.log(code, ";;,", cursocket);

  //     // 与服务器连接成功
  //     cursocket.on("connect", () => {
  //       console.log("client get" + cursocket.id);
  //     });
  //     // 向服务器发送消息
  //     cursocket.emit("requetbyclient", {
  //       message: "client sent to you",
  //     });
  //     // 接收服务器发送的消息
  //     cursocket.on("sendtoclient", (message: any) => {
  //       console.log(message);
  //     });
  //   }
  // }, [cursocket, code]);
  useEffect(() => {
    if (!cursocket.current) {
      // setCurSocket(io("http://127.0.0.1:3000"));
      cursocket.current = io("ws://127.0.0.1:3000", {
        transports: ["websocket"],
      });
      // 与服务器连接成功
      cursocket.current.on("connect", () => {
        console.log("client get" + cursocket.current.id);
      });
      //store 存储sokcet实例
      editStore.initSocket(cursocket.current);

      // 接收服务器发送的消息
      cursocket.current.on("fromserver", (message: any) => {
        if (message.status === "done") {
          editStore.previewView();
          editStore.updateSpin(false);
        }
        if (message.rewrite)
          window.frames[0].location.href = `${editStore.viewSrc}`;
      });
      // 接收服务器发送的消息
      cursocket.current.on("compileInfo", (message: any) => {
        editStore.updateMsg(message);
        console.log("show:", message.msg);
        setTimeout(() => {
          if ((editStore.logPanelRef as any).current) {
            (editStore.logPanelRef as any).current.scrollTop =
              (editStore.logPanelRef as any).current.scrollHeight + 400;
          }
        });
      });
      // 初始化预览页面服务器
      editStore.updateSpin(true);
      (editStore.socket as any) &&
        (editStore.socket as any).emit("initProject", {
          tmp: editStore.curTemplate,
        });
    }
  }, []);

  return (
    <div className="mika-mona-center-editor">
      <MonacoEditor
        height="600"
        language="javascript"
        theme="vs-dark"
        value={editStore.code}
        options={options}
        onChange={onChange}
        editorDidMount={editorDidMount}
      ></MonacoEditor>
    </div>
  );
}

export default observer(MainEditor);
