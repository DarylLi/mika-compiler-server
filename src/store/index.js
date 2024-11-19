import { makeAutoObservable } from "mobx";

class EditorStore {
  // curTemplate = "createReactDemo";
  // curType = "create-react-demo-tmp";
  curTemplate = "rustUmi";
  curType = "rust-umi-generate";
  curStatic = "dist";
  fileInfo = undefined;
  code = "";
  socket = null;
  showView = false;
  showSpin = false;
  logPanelRef = null;
  logMsg = [];
  viewSrc = `editorTarget/${this.curTemplate}/${this.curType}/${
    this.curStatic || "dist"
  }/index.html`;

  constructor() {
    makeAutoObservable(this);
  }
  setLogPanelRef(ref) {
    this.logPanelRef = ref;
  }
  clearLog() {
    this.logMsg = [];
  }
  updateMsg(msg) {
    this.logMsg = [...this.logMsg, msg];
  }
  initSocket(socket) {
    this.socket = socket;
  }
  updateSpin(show) {
    this.showSpin = show;
  }
  updateInfo(data) {
    this.fileInfo = data;
  }
  updateCode(code) {
    this.code = code;
  }
  previewView(code) {
    this.showView = true;
  }
}

const editStore = new EditorStore();
export { editStore, EditorStore };
