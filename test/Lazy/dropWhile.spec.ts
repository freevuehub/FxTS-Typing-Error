import {
  dropWhile,
  filter,
  map,
  pipe,
  toArray,
  toAsync,
} from "../../src/index";
import { AsyncFunctionException } from "../../src/_internal/error";

describe("drop", function () {
  describe("sync", function () {
    it("should be dropped elements until the value applied to callback returns falsey", function () {
      const acc = [];
      for (const a of dropWhile((a) => a < 3, [1, 2, 3, 4, 5])) {
        acc.push(a);
      }
      expect(acc).toEqual([3, 4, 5]);
    });

    it("should be able to be used as a curried function in the pipeline", function () {
      const res = pipe(
        [1, 2, 3, 4, 5, 6, 7, 8],
        map((a) => a + 10),
        filter((a) => a % 2 === 0),
        dropWhile((a) => a < 16),
        toArray,
      );

      expect(res).toEqual([16, 18]);
    });

    it("should throw an error when the callback is asynchronous", function () {
      const res = () => [...dropWhile(async (a) => a > 5, [1, 2, 3, 4, 5])];
      expect(res).toThrowError(new AsyncFunctionException());
    });
  });

  describe("async", function () {
    it("should be dropped elements until the value applied to callback returns falsey", async function () {
      const acc = [];
      for await (const a of dropWhile((a) => a < 3, toAsync([1, 2, 3, 4, 5]))) {
        acc.push(a);
      }
      expect(acc).toEqual([3, 4, 5]);
    });

    it("should be able to be used as a curried function in the pipeline", async function () {
      const res = await pipe(
        toAsync([1, 2, 3, 4, 5, 6, 7, 8]),
        map((a) => a + 10),
        filter((a) => a % 2 === 0),
        dropWhile((a) => a < 16),
        toArray,
      );

      expect(res).toEqual([16, 18]);
    });

    it("should be able to handle an error when asynchronous", async function () {
      await expect(
        pipe(
          toAsync([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
          dropWhile((a) => {
            if (a > 5) {
              throw new Error("err");
            }
            return true;
          }),
          toArray,
        ),
      ).rejects.toThrow("err");
    });
  });
});
