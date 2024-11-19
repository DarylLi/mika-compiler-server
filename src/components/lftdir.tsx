import React, { useState, useEffect } from "react";
import MonacoEditor from "react-monaco-editor";
import { Tree } from "antd";
import templates from "@server/mock";
import crd from "@server/crd";
import umiRust from "@server/rustUmiGenerate";
import { editStore } from "@store/index";
import { observable } from "mobx";

const projcetTmp = { ...templates, ...crd, ...umiRust };

console.log(`%c${Object.keys(projcetTmp).join(" | ")}`, "color:maroon");
console.log(projcetTmp[editStore.curTemplate]);
function Directory() {
  const [stat, setStat] = useState(1);
  const [code, setCode] = useState("");
  const [spendKeys, setSpendKeys] = useState([editStore?.curType || "vue"]);
  const editorDidMount = (editor: any, monaco: any) => {
    console.log("editorDidMount", editor);
    editor.focus();
  };
  const onChange = (newValue: any, e: any) => {
    console.log("onChange", newValue, e);
  };
  const options = {
    selectOnLineNumbers: true,
  };
  function init(data: any) {
    const request = (window.indexedDB || (window as any).webkitIndexedDB).open(
      data.storeName,
      data.version
    );
    request.onsuccess = (e: any) => {
      console.log("数据库打开成功", e.target.result);
      data.db = e.target.result;
    };
    request.onerror = (e: any) => {
      console.log("数据库启动报错", e);
      throw Error("数据库报错啦：" + e.target.result);
    };
    //数据库创建或者升级的时候都会触发
    request.onupgradeneeded = (e: any) => {
      data.db = e.target.result;
      let objectStore = null;
      if (!data.db.objectStoreNames.contains(data.storeName)) {
        //在数据库中创建表group,设置主键为id，属性中必须要有id的字段
        objectStore = data.db.createObjectStore(data.storeName, {
          keyPath: "id",
        });
        //创建索引indexName指向表中的name字段且设为唯一值，不能重复，属性中可以没有name属性，但是id必须要有
        objectStore.createIndex("indexName", "name", {
          unique: true,
        }); // 创建索引 可以让你搜索任意字段
      }
    };
    return data;
  }
  const addData = (db: any, storeName: any, obj: any) => {
    console.log(db);
    //readwrite 读写操作的权限
    const request = db
      .transaction(storeName, "readwrite")
      .objectStore(storeName)
      .add(obj);
    request.onsuccess = (e: any) => {
      console.log("写入成功", e.target.result);
      //这里可以做一些操作，添加第一次之后数据还是相同的就要进行阻止或者清空，否则报错
      //readyState为done是添加完毕
    };
    request.onerror = (e: any) => {
      console.log("写入失败：", e);
      throw Error("写入失败：" + e.target.result);
    };
  };
  const getData = (db: any, storeName: any, key: any) => {
    // transaction 第二个参数不写，默认是只读，key是当前属性的id值
    const request = db.transaction([storeName]).objectStore(storeName).get(key);
    request.onsuccess = (e: any) => {
      console.log("读取成功", e.target.result);
    };
    request.onerror = (e: any) => {
      console.log("读取失败：", e);
      throw Error("读取失败：" + e.target.result);
    };
  };

  const getAllData = (db: any, storeName: any) => {
    // transaction 第二个参数不写，默认是只读
    const request = db.transaction(storeName).objectStore(storeName).getAll();
    console.log(request);
    request.onsuccess = (e: any) => {
      console.log("读取全部成功", e.target.result);
    };
    request.onerror = (e: any) => {
      console.log("读取全部失败：", e);
      throw Error("读取全部失败：" + e.target.result);
    };
  };
  // 通过索引name获取数据
  const getNameData = (db: any, storeName: any, name: any) => {
    // transaction 第二个参数不写，默认是只读
    const request = db
      .transaction([storeName])
      .objectStore(storeName)
      .index("indexName")
      .get(name);
    request.onsuccess = (e: any) => {
      console.log("读取索引成功", e.target.result);
    };
    request.onerror = (e: any) => {
      console.log("读取索引失败：", e);
      throw Error("读取索引失败：" + e.target.result);
    };
  };

  // 更新某一条数据
  const upData = (db: any, storeName: any, data: any) => {
    const request = db
      .transaction([storeName], "readwrite")
      .objectStore(storeName)
      .put(data);
    request.onsuccess = (e: any) => {
      //readyState为done是更新完毕，或者result会返回当前的id值可进行判断
      console.log(e.target.result, e.target);
      console.log("更新成功", e.target.result);
    };
    request.onerror = (e: any) => {
      console.log("更新失败：", e);
      throw Error("更新失败：" + e.target.result);
    };
  };
  // 删除某一条数据
  const deleteData = (db: any, storeName: any, key: any) => {
    const request = db
      .transaction([storeName], "readwrite")
      .objectStore(storeName)
      .delete(key); //key---id值
    request.onsuccess = (e: any) => {
      //readyState为done是更新完毕
      console.log(e.target.result, e.target);
      console.log("删除成功", e.target.result);
    };
    request.onerror = (e: any) => {
      console.log("删除失败：", e);
      throw Error("删除失败：" + e.target.result);
    };
  };
  // 使用指针遍历所有值使用id
  const fORData = (db: any, storeName: any) => {
    const request = db
      .transaction([storeName], "readwrite")
      .objectStore(storeName);
    request.openCursor().onsuccess = (e: any) => {
      //readyState为done是更新完毕
      var cursor = (event as any).target.result;
      if (cursor) {
        console.log(
          "当前的id值： " + cursor.key + " 和age值 " + cursor.value.age
        );
        cursor.continue();
      } else {
        console.log("结束遍历");
      }
    };
    request.onerror = (e: any) => {
      console.log("遍历所有值失败：", e);
      throw Error("遍历所有值失败：" + e.target.result);
    };
  };
  // 使用指针遍历所有值，使用name索引
  const fORData1 = (db: any, storeName: any) => {
    const objectStore = db.transaction([storeName]).objectStore(storeName);
    var index = objectStore.index("indexName");
    const range = IDBKeyRange.bound(1, 10); //遍历id从1到10的数据
    index.openCursor(range).onsuccess = function (event: any) {
      var cursor = event.target.result;
      if (cursor) {
        console.log(
          "当前的name值： " + cursor.key + " 和age值 " + cursor.value.id
        );
        cursor.continue();
      } else {
        console.log("结束遍历");
      }
    };

    index.openCursor(range).onerror = (e: any) => {
      console.log("遍历所有值失败：", e);
      throw Error("遍历所有值失败：" + e.target.result);
    };
  };

  const onExpand: any = (expandedKeys: any, expanded: boolean) => {
    console.log(expandedKeys, expanded);
    setSpendKeys(expandedKeys);
  };
  const onSelect = (selectedKeys: any[], info: any) => {
    console.log("selected", info.node);
    info?.node?.kind !== "directory" &&
      editStore.updateCode(info?.node?.value || "");
    info?.node?.kind !== "directory" && editStore.updateInfo(info?.node || "");
    getDBSaved({});
    setSpendKeys(
      spendKeys.includes(info?.node?.filename)
        ? spendKeys.filter((e) => e !== info.node.filename)
        : [...spendKeys, info?.node?.filename]
    );
  };
  const getDBSaved = (data: any) => {
    const curData = {
      db: null,
      storeName: "teswt", //当前的数据库名
      version: 1, //版本号
    };
    const studentA = {
      id: "121",
      age: "Valdivia",
      name: "pandres@pandres.com",
    };
    const curRequest = init(curData);
    setTimeout(() => {
      // addData(curRequest.db, "teswt", studentA);
      let cData = getAllData(curRequest.db, "teswt");
      console.log(cData);
    }, 3000);
    // let curDb: any = null;
    // const request = (window.indexedDB || (window as any).webkitIndexedDB).open(
    //   "test",
    //   1
    // );
    // request.onsuccess = (e: any) => {
    //   console.log("数据库打开成功", e.target.result);
    //   curDb = e.target.result;
    //   const studentA = {
    //     age: "Valdivia",
    //     name: "pandres@pandres.com",
    //   };
    //   addData(curDb, "test", studentA);
    // };
    // setTimeout(() => {
    //   let cData = getAllData(curDb, "test");
    //   console.log(cData);
    // }, 2000);
  };
  return (
    <div className="mika-mona-left-dir">
      <Tree
        showLine={true}
        showIcon={true}
        defaultExpandedKeys={["react"]}
        onSelect={onSelect}
        onExpand={onExpand}
        expandedKeys={spendKeys}
        treeData={(projcetTmp as any)[editStore.curTemplate || ""]}
        fieldNames={{ title: "filename", key: "path" }}
      />
    </div>
  );
}

export default Directory;
