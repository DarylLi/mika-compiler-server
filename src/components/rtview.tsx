import React, { useState, useEffect, useRef } from "react";
import { editStore } from "@store/index";
import { observer } from "mobx-react-lite";

function RightView() {
  // let cursocket: any = null;
  const [showView, setShowView] = useState(false);
  const frameRef: any = useRef(null);

  return (
    <div className="mika-mona-right-view">
      {editStore.showView && (
        <iframe ref={frameRef} src={editStore.viewSrc} frameBorder={0}></iframe>
      )}
    </div>
  );
}

export default observer(RightView);
