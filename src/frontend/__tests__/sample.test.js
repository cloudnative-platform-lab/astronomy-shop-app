describe("Basic CI sanity test", () => {
  test("adds numbers correctly", () => {
    expect(2 + 2).toBe(4);
  });

  test("string works", () => {
    expect("devops").toContain("dev");
  });
});
