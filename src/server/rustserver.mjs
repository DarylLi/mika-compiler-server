const rust = import("../../pkg/index.js");

rust.then((res) => {
  // res.greet("wo hua");
  res.generateJsonFile("rust-umi-generate", "./react-umi", "testRust.js");
});
console.log("testing rust server");
