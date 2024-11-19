import startCase from "@lodash/startCase";
const { useState } = React;
console.log(startCase("fooBar"));
function Enter() {
  const [txt, setTxt] = useState(0);
  const getCall = () => {
    alert("wasai");
    setTxt(txt + 1);
  };

  return <div onClick={() => getCall()}>kukuji{txt}</div>;
}
const root = ReactDOM.createRoot(document.getElementById("target"));
Enter && root.render(<Enter />);
