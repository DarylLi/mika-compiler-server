setTimeout(async () => {
  const rust = import("./pkg");
  console.log(rust);
  rust.then((res) => {
    console.log(res);
    res.greet("cal");
  });
});
