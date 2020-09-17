{
  const noop = new Object()

  function* main2() {
    yield noop
    function* f(i) {
      yield noop
      return i === 0 ? 0 : (yield f(i - 1)) + (yield f(i - 1))
    }
    yield noop
    return yield f(20)
  }

  function runner(main) {
    const stack = []
    let iter = main()
    let value;
    let done;
    while (true) {
      ;({ value, done } = iter.next(value))
      if (done) {
        if (stack.length === 0) {
          return value
        } else {
          iter = stack.pop()
        }
      } else {
        if (value !== noop) {
          // it's some func call
          stack.push(iter)
          iter = value
        }
      }
    }
  }

  function* main2_while_unroll() {
    yield noop
    function* f(i) {
      yield noop
      if (i === 0) {
        return 0
      } else {
        let val1 = undefined
        {
          const it = f(i - 1)
          while (true) {
            yield noop
            ;({ value, done } = it.next())
            if (done) {
              val1 = value
              break
            }
          }
        }
        let val2 = undefined
        {
          const it = f(i - 1)
          while (true) {
            yield noop
            ;({ value, done } = it.next())
            if (done) {
              val2 = value
              break
            }
          }
        }
        return val1 + val2
      }
    }
    yield noop
    let val2 = undefined
    {
      const it = f(16)
      while (true) {
        yield noop
        ;({ value, done } = it.next())
        if (done) {
          val2 = value
          break
        }
      }
    }
    return val2
  }

  function runner_while_unroll(main) {
    const it = main()
    while (true) {
      ;({ value, done } = it.next())
      if (done) {
        return value
      }
    }
  }

  function* main2_multiyield() {
    yield noop
    function* f(i) {
      yield noop
      return i === 0 ? 0 : (yield* f(i - 1)) + (yield* f(i - 1))
    }
    yield noop
    return yield* f(20)
  }

  function* tcomain_multiyield() {
    yield noop
    function* f(i) {
      yield noop
      if (i === 0) {
        return 0
      } else {
        return f(i - 1)
      }
    }
    yield noop
    let val = undefined
    {
      let it = f(100000)
      while (true) {
        const value = yield* it
        if (value.next !== undefined) {
          it = value
        } else {
          val = value
          break
        }
      }
    }
    return val
  }

  function runner_multiyield(main) {
    const it = main()
    while (true) {
      ;({ value, done } = it.next())
      if (done) {
        return value
      }
    }
  }

  {
    const start = new Date().getTime()
    console.log(runner(main2))
    console.log(new Date().getTime() - start)
  }
  {
    const start = new Date().getTime()
    console.log(runner_while_unroll(main2_while_unroll))
    console.log(new Date().getTime() - start)
  }
  {
    const start = new Date().getTime()
    console.log(runner_multiyield(main2_multiyield))
    console.log(new Date().getTime() - start)
  }
}
