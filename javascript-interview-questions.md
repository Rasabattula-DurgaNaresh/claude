# JavaScript In-Depth Interview Questions & Answers

> Complete reference for senior/mid-level JavaScript interviews — covering core concepts, tricky edge cases, and real-world patterns with runnable code examples.

---

## Table of Contents

1. [Execution Context & Call Stack](#1-execution-context--call-stack)
2. [Hoisting](#2-hoisting)
3. [Scope & Scope Chain](#3-scope--scope-chain)
4. [Closures](#4-closures)
5. [this Keyword](#5-this-keyword)
6. [Prototypes & Inheritance](#6-prototypes--inheritance)
7. [Event Loop, Microtasks & Macrotasks](#7-event-loop-microtasks--macrotasks)
8. [Promises & Async/Await](#8-promises--asyncawait)
9. [Generators & Iterators](#9-generators--iterators)
10. [Currying & Partial Application](#10-currying--partial-application)
11. [Memoization](#11-memoization)
12. [Debounce & Throttle](#12-debounce--throttle)
13. [Deep Clone](#13-deep-clone)
14. [Event Delegation](#14-event-delegation)
15. [WeakMap, WeakSet & Memory Management](#15-weakmap-weakset--memory-management)
16. [Symbol & Well-Known Symbols](#16-symbol--well-known-symbols)
17. [Proxy & Reflect](#17-proxy--reflect)
18. [Design Patterns](#18-design-patterns)
19. [Functional Programming](#19-functional-programming)
20. [Tricky Output Questions](#20-tricky-output-questions)

---

## 1. Execution Context & Call Stack

### Q1: What is an Execution Context? How many types are there?

**Answer:**
An Execution Context (EC) is the environment in which JavaScript code is evaluated and executed. Every time code runs, it runs inside an EC.

**Three types:**
- **Global EC** — created when the script first loads (one per program)
- **Function EC** — created each time a function is invoked
- **Eval EC** — created inside `eval()` (avoid in practice)

Each EC has two phases:
1. **Creation Phase** — sets up `VariableEnvironment`, `LexicalEnvironment`, and `this` binding
2. **Execution Phase** — runs the code line by line

```javascript
// Visualising Execution Contexts

let globalVar = "I am global";   // lives in Global EC

function outer() {
  let outerVar = "outer";        // lives in outer's EC

  function inner() {
    let innerVar = "inner";      // lives in inner's EC
    console.log(globalVar);      // accessible via scope chain
    console.log(outerVar);       // accessible via scope chain
    console.log(innerVar);       // local
  }

  inner(); // pushes inner EC onto call stack
}

outer(); // pushes outer EC onto call stack

/*
  Call Stack at peak:
  ┌─────────────┐
  │  inner EC   │  ← top (currently executing)
  ├─────────────┤
  │  outer EC   │
  ├─────────────┤
  │  Global EC  │  ← bottom (always present)
  └─────────────┘
*/
```

---

### Q2: What is the Call Stack? What happens when it overflows?

**Answer:**
The Call Stack is a LIFO (Last In, First Out) data structure that tracks which function is currently executing. When a function is called, its EC is pushed; when it returns, it's popped.

**Stack Overflow** occurs when there are too many nested calls (most commonly infinite recursion):

```javascript
// Stack Overflow example
function recurse() {
  return recurse(); // never returns → stack fills up
}

try {
  recurse();
} catch (e) {
  console.log(e.message); // "Maximum call stack size exceeded"
}

// ─── Safe recursion with proper base case ───────────────────────────────
function factorial(n) {
  if (n <= 1) return 1;    // BASE CASE — stops recursion
  return n * factorial(n - 1);
}

console.log(factorial(5)); // 120

// ─── Tail-call optimisation style (TCO) ─────────────────────────────────
// JS engines may optimise this (V8 in strict mode)
function factTCO(n, acc = 1) {
  if (n <= 1) return acc;
  return factTCO(n - 1, n * acc); // tail position
}

console.log(factTCO(5)); // 120

// ─── Trampolining — avoids stack overflow for deep recursion ─────────────
function trampoline(fn) {
  return function (...args) {
    let result = fn(...args);
    while (typeof result === "function") result = result();
    return result;
  };
}

const safeFactorial = trampoline(function fact(n, acc = 1) {
  if (n <= 1) return acc;
  return () => fact(n - 1, n * acc); // returns a thunk instead of recursing
});

console.log(safeFactorial(100000)); // works without stack overflow
```

---

## 2. Hoisting

### Q3: Explain Hoisting in detail. What is hoisted and what isn't?

**Answer:**
Hoisting is the process by which the JS engine moves declarations to the top of their scope during the **Creation Phase** of execution. Only **declarations** are hoisted, NOT initialisations.

```javascript
// ─── var is hoisted AND initialised to undefined ─────────────────────────
console.log(x); // undefined  (not ReferenceError)
var x = 5;
console.log(x); // 5

// Internally the engine sees:
// var x;          ← hoisted
// console.log(x); // undefined
// x = 5;
// console.log(x); // 5

// ─── let and const are hoisted but NOT initialised (Temporal Dead Zone) ──
try {
  console.log(y); // ReferenceError: Cannot access 'y' before initialization
} catch (e) {
  console.log(e.message);
}
let y = 10;

// ─── Function declarations are fully hoisted (name + body) ───────────────
console.log(greet("Alice")); // "Hello, Alice"  — works before definition!

function greet(name) {
  return `Hello, ${name}`;
}

// ─── Function expressions are NOT fully hoisted ──────────────────────────
try {
  console.log(sayHi()); // TypeError: sayHi is not a function
} catch (e) {
  console.log(e.message);
}

var sayHi = function () {
  return "Hi!";
};
// Only 'var sayHi' is hoisted (as undefined), not the function body

// ─── Class declarations — hoisted but in TDZ (like let/const) ────────────
try {
  const obj = new Animal(); // ReferenceError
} catch (e) {
  console.log(e.message);
}

class Animal {}
```

### Q4: What is the Temporal Dead Zone (TDZ)?

```javascript
// TDZ is the period between entering a scope and the variable being initialised
// During TDZ, accessing the variable throws ReferenceError

{
  // TDZ for 'color' starts here
  console.log(typeof color); // ReferenceError (NOT undefined like with var!)
  let color = "blue";        // TDZ ends here
  console.log(color);        // "blue"
}

// ─── Practical TDZ trap ────────────────────────────────────────────────────
let val = "outer";

function check() {
  // TDZ for inner 'val' starts at top of this function
  console.log(val); // ReferenceError — NOT "outer"!
  let val = "inner";
}

try { check(); } catch (e) { console.log(e.message); }
// "Cannot access 'val' before initialization"
```

---

## 3. Scope & Scope Chain

### Q5: Explain the different types of scope in JavaScript.

```javascript
// ─── 1. Global Scope ──────────────────────────────────────────────────────
var globalVar = "global";    // accessible everywhere
let blockLet  = "block";     // also global, but not on window object

// ─── 2. Function Scope ────────────────────────────────────────────────────
function myFunc() {
  var funcVar = "function scope"; // NOT accessible outside
  console.log(globalVar);         // can access global
}

// ─── 3. Block Scope (ES6+) ────────────────────────────────────────────────
{
  var varInBlock = "still accessible"; // var ignores block scope!
  let letInBlock = "block scoped";
  const constInBlock = "block scoped";
}
console.log(varInBlock);   // "still accessible"
// console.log(letInBlock); // ReferenceError

// ─── 4. Module Scope ──────────────────────────────────────────────────────
// In ES modules, top-level declarations are module-scoped, not global

// ─── Scope Chain ──────────────────────────────────────────────────────────
const a = 1;

function outer() {
  const b = 2;

  function middle() {
    const c = 3;

    function inner() {
      const d = 4;
      // Can access a, b, c, d via scope chain
      console.log(a + b + c + d); // 10
    }
    inner();
  }
  middle();
}
outer();

// The scope chain is determined LEXICALLY (at write time, not call time)
const x = "global x";

function foo() {
  console.log(x); // "global x" — looks up the scope chain lexically
}

function bar() {
  const x = "bar's x";
  foo(); // foo still prints "global x" — it's lexically bound to global scope
}
bar();
```

---

## 4. Closures

### Q6: What is a Closure? Give practical use cases.

**Answer:**
A closure is a function that **remembers** the variables from its lexical scope even when the function is executed outside that scope. The inner function closes over the outer function's variables.

```javascript
// ─── Basic Closure ────────────────────────────────────────────────────────
function makeCounter(initial = 0) {
  let count = initial; // this variable is "closed over"

  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount:  () => count,
    reset:     () => { count = initial; }
  };
}

const counter = makeCounter(10);
console.log(counter.increment()); // 11
console.log(counter.increment()); // 12
console.log(counter.decrement()); // 11
console.log(counter.getCount());  // 11
counter.reset();
console.log(counter.getCount());  // 10

// Each call creates an independent closure
const counter2 = makeCounter(0);
console.log(counter2.getCount()); // 0 — independent of counter

// ─── Closure for Private State ────────────────────────────────────────────
function createBankAccount(initialBalance) {
  let balance = initialBalance; // private — cannot be accessed directly

  return {
    deposit(amount) {
      if (amount <= 0) throw new Error("Amount must be positive");
      balance += amount;
      return balance;
    },
    withdraw(amount) {
      if (amount > balance) throw new Error("Insufficient funds");
      balance -= amount;
      return balance;
    },
    getBalance() { return balance; }
  };
}

const account = createBankAccount(1000);
console.log(account.getBalance()); // 1000
console.log(account.deposit(500)); // 1500
console.log(account.withdraw(200));// 1300
// console.log(account.balance);   // undefined — truly private!

// ─── Classic Closure Gotcha with var ─────────────────────────────────────
// PROBLEM:
const funcs = [];
for (var i = 0; i < 3; i++) {
  funcs.push(function () { return i; });
}
console.log(funcs[0]()); // 3 — NOT 0! (all share the same 'i')
console.log(funcs[1]()); // 3
console.log(funcs[2]()); // 3

// FIX 1: Use let (block scope creates a new binding each iteration)
const funcs2 = [];
for (let i = 0; i < 3; i++) {
  funcs2.push(function () { return i; });
}
console.log(funcs2[0]()); // 0
console.log(funcs2[1]()); // 1
console.log(funcs2[2]()); // 2

// FIX 2: IIFE to capture current value of i
const funcs3 = [];
for (var i = 0; i < 3; i++) {
  funcs3.push((function (j) {
    return function () { return j; };
  })(i));
}
console.log(funcs3[0]()); // 0

// ─── Closure for Once Function ────────────────────────────────────────────
function once(fn) {
  let called = false;
  let result;
  return function (...args) {
    if (!called) {
      called  = true;
      result  = fn.apply(this, args);
    }
    return result;
  };
}

const initDB = once(() => {
  console.log("DB connected");
  return { connected: true };
});

initDB(); // "DB connected"
initDB(); // (nothing — already called)
initDB(); // (nothing)
```

---

## 5. `this` Keyword

### Q7: Explain how `this` is determined in different contexts.

```javascript
// ─── 1. Global context ────────────────────────────────────────────────────
console.log(this); // Window (browser) / global (Node.js non-strict)

// ─── 2. Regular function — this = calling object ─────────────────────────
function showThis() {
  console.log(this);
}
showThis(); // Window / global (non-strict) | undefined (strict mode)

// ─── 3. Method context — this = object before the dot ────────────────────
const user = {
  name: "Alice",
  greet() {
    console.log(`Hello, ${this.name}`);
  }
};
user.greet(); // "Hello, Alice"

// Losing 'this' context
const greetFn = user.greet;
greetFn(); // "Hello, undefined" — this is now global/undefined

// ─── 4. Arrow functions — no own 'this', inherit from enclosing scope ─────
const obj = {
  name: "Bob",
  greetArrow: () => {
    console.log(this?.name); // undefined — arrow inherits global this
  },
  greetRegular() {
    const arrow = () => {
      console.log(this.name); // "Bob" — closes over method's 'this'
    };
    arrow();
  }
};
obj.greetArrow();   // undefined
obj.greetRegular(); // "Bob"

// ─── 5. Explicit binding: call, apply, bind ───────────────────────────────
function introduce(city, country) {
  return `I'm ${this.name} from ${city}, ${country}`;
}

const person = { name: "Charlie" };

// call — args as comma-separated list
console.log(introduce.call(person, "Mumbai", "India"));
// "I'm Charlie from Mumbai, India"

// apply — args as array
console.log(introduce.apply(person, ["Delhi", "India"]));
// "I'm Charlie from Delhi, India"

// bind — returns a new function with 'this' bound permanently
const boundFn = introduce.bind(person, "Bangalore");
console.log(boundFn("India")); // "I'm Charlie from Bangalore, India"

// ─── 6. new keyword — this = the new object being created ─────────────────
function Person(name, age) {
  this.name = name;
  this.age  = age;
  // implicitly returns 'this'
}
const alice = new Person("Alice", 30);
console.log(alice.name); // "Alice"

// ─── Binding priority: new > bind > call/apply > object method > global ───
function test() { console.log(this.val); }
const obj1 = { val: 1 };
const obj2 = { val: 2 };

const bound = test.bind(obj1);
bound.call(obj2); // 1 — bind wins over call

function Constructor() { console.log(this); }
const boundCtor = Constructor.bind(obj1);
const instance = new boundCtor(); // {} — new wins over bind
```

---

## 6. Prototypes & Inheritance

### Q8: How does the Prototype Chain work? Implement classical inheritance.

```javascript
// ─── Prototype basics ─────────────────────────────────────────────────────
function Animal(name) {
  this.name = name;
}

// Methods on prototype — shared across all instances (memory efficient)
Animal.prototype.speak = function () {
  return `${this.name} makes a sound.`;
};

Animal.prototype.toString = function () {
  return `Animal(${this.name})`;
};

const cat = new Animal("Whiskers");
console.log(cat.speak());        // "Whiskers makes a sound."
console.log(cat.hasOwnProperty("name"));   // true — own property
console.log(cat.hasOwnProperty("speak"));  // false — on prototype

// Prototype chain lookup:
// cat → Animal.prototype → Object.prototype → null

// ─── Prototype Chain Inspection ───────────────────────────────────────────
console.log(Object.getPrototypeOf(cat) === Animal.prototype); // true
console.log(cat instanceof Animal);   // true
console.log(cat instanceof Object);   // true

// ─── Prototypal Inheritance (ES5 style) ───────────────────────────────────
function Dog(name, breed) {
  Animal.call(this, name); // call parent constructor
  this.breed = breed;
}

// Set up prototype chain: Dog.prototype → Animal.prototype → Object.prototype
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog; // restore constructor reference

Dog.prototype.speak = function () {
  return `${this.name} barks!`;
};

Dog.prototype.fetch = function (item) {
  return `${this.name} fetches the ${item}!`;
};

const rex = new Dog("Rex", "Labrador");
console.log(rex.speak());         // "Rex barks!" — overrides Animal
console.log(rex.fetch("ball"));   // "Rex fetches the ball!"
console.log(rex instanceof Dog);  // true
console.log(rex instanceof Animal); // true — chain works!

// ─── ES6 Class Syntax (sugar over prototypes) ─────────────────────────────
class Vehicle {
  #fuel = 100; // private field

  constructor(make, model) {
    this.make  = make;
    this.model = model;
  }

  get info() {
    return `${this.make} ${this.model}`;
  }

  getFuel() { return this.#fuel; }

  refuel(amount) {
    this.#fuel = Math.min(100, this.#fuel + amount);
    return this;
  }

  static compare(v1, v2) {
    return v1.make.localeCompare(v2.make);
  }

  toString() {
    return `[Vehicle: ${this.info}]`;
  }
}

class ElectricCar extends Vehicle {
  #battery = 100;

  constructor(make, model, range) {
    super(make, model); // must call super before using 'this'
    this.range = range;
  }

  charge(amount) {
    this.#battery = Math.min(100, this.#battery + amount);
    return this;
  }

  toString() {
    return `[ElectricCar: ${this.info}, range: ${this.range}km]`;
  }
}

const tesla = new ElectricCar("Tesla", "Model 3", 500);
console.log(tesla.toString());         // "[ElectricCar: Tesla Model 3, range: 500km]"
console.log(tesla instanceof Vehicle); // true
console.log(Object.getPrototypeOf(ElectricCar) === Vehicle); // true

// ─── Mixin Pattern for multiple inheritance ────────────────────────────────
const Serializable = (Base) => class extends Base {
  serialize() {
    return JSON.stringify(this);
  }
  static deserialize(json) {
    return Object.assign(new this(), JSON.parse(json));
  }
};

const Validatable = (Base) => class extends Base {
  validate() {
    return Object.keys(this).every(key => this[key] !== null && this[key] !== undefined);
  }
};

class Point {
  constructor(x, y) { this.x = x; this.y = y; }
}

class SmartPoint extends Serializable(Validatable(Point)) {}

const p = new SmartPoint(3, 4);
console.log(p.validate());  // true
console.log(p.serialize()); // '{"x":3,"y":4}'
```

---

## 7. Event Loop, Microtasks & Macrotasks

### Q9: Explain the Event Loop. What is the difference between microtasks and macrotasks?

```javascript
/*
  JavaScript Runtime Architecture:
  ┌─────────────────────────────────────────┐
  │           CALL STACK                    │
  │  (synchronous code executes here)       │
  └───────────────┬─────────────────────────┘
                  │ empty?
                  ▼
  ┌─────────────────────────────────────────┐
  │         MICROTASK QUEUE                 │  ← drained completely first!
  │  Promise.then/catch, queueMicrotask,    │
  │  MutationObserver callbacks             │
  └───────────────┬─────────────────────────┘
                  │ empty?
                  ▼
  ┌─────────────────────────────────────────┐
  │         MACROTASK QUEUE                 │  ← one task at a time
  │  setTimeout, setInterval, setImmediate, │
  │  I/O callbacks, UI rendering            │
  └─────────────────────────────────────────┘
  
  EVENT LOOP: check stack → if empty, drain microtasks → take one macrotask
              → repeat
*/

// ─── Classic Event Loop Question ─────────────────────────────────────────
console.log("1 - sync");

setTimeout(() => console.log("2 - setTimeout (macrotask)"), 0);

Promise.resolve()
  .then(() => console.log("3 - Promise.then (microtask)"))
  .then(() => console.log("4 - chained .then (microtask)"));

queueMicrotask(() => console.log("5 - queueMicrotask"));

console.log("6 - sync");

/*
Output:
  1 - sync
  6 - sync
  3 - Promise.then (microtask)   ← microtasks run before macrotasks!
  4 - chained .then (microtask)
  5 - queueMicrotask
  2 - setTimeout (macrotask)
*/

// ─── Microtask starvation ──────────────────────────────────────────────────
// If microtasks keep queuing more microtasks, macrotasks never run!
let count = 0;
function recursiveMicrotask() {
  if (count < 5) {
    count++;
    Promise.resolve().then(recursiveMicrotask); // queues another microtask
    console.log(`Microtask #${count}`);
  }
}
// This is fine for 5 iterations, but infinite would block everything

// ─── Nested setTimeout vs setInterval ─────────────────────────────────────
// setTimeout(fn, 0) guarantees MINIMUM 4ms delay in browsers (HTML spec)
const start = Date.now();
setTimeout(() => {
  console.log(`Actual delay: ${Date.now() - start}ms`); // often 4-8ms
}, 0);

// ─── Promise vs setTimeout ordering ──────────────────────────────────────
async function runOrder() {
  console.log("A");
  await Promise.resolve(); // yields to microtask queue
  console.log("B");        // runs as microtask
}

runOrder();
setTimeout(() => console.log("C"), 0); // macrotask
console.log("D");

// Output: A, D, B, C
```

---

## 8. Promises & Async/Await

### Q10: Implement Promise from scratch.

```javascript
// ─── Custom Promise Implementation ───────────────────────────────────────
class MyPromise {
  #state    = "pending";
  #value    = undefined;
  #handlers = []; // { onFulfilled, onRejected, resolve, reject }

  constructor(executor) {
    const resolve = (value) => {
      if (this.#state !== "pending") return;
      // If resolving with a thenable, chain it
      if (value && typeof value.then === "function") {
        value.then(resolve, reject);
        return;
      }
      this.#state = "fulfilled";
      this.#value = value;
      this.#handlers.forEach(this.#handleSettled.bind(this));
    };

    const reject = (reason) => {
      if (this.#state !== "pending") return;
      this.#state = "rejected";
      this.#value = reason;
      this.#handlers.forEach(this.#handleSettled.bind(this));
    };

    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }

  #handleSettled({ onFulfilled, onRejected, resolve, reject }) {
    // Always async (spec requirement)
    queueMicrotask(() => {
      try {
        if (this.#state === "fulfilled") {
          const result = onFulfilled ? onFulfilled(this.#value) : this.#value;
          resolve(result);
        } else {
          const result = onRejected ? onRejected(this.#value) : (() => { throw this.#value; })();
          resolve(result);
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      const handler = { onFulfilled, onRejected, resolve, reject };
      if (this.#state === "pending") {
        this.#handlers.push(handler);
      } else {
        this.#handleSettled(handler);
      }
    });
  }

  catch(onRejected) { return this.then(undefined, onRejected); }

  finally(onFinally) {
    return this.then(
      value  => MyPromise.resolve(onFinally()).then(() => value),
      reason => MyPromise.resolve(onFinally()).then(() => { throw reason; })
    );
  }

  static resolve(value) {
    return new MyPromise(resolve => resolve(value));
  }

  static reject(reason) {
    return new MyPromise((_, reject) => reject(reason));
  }

  static all(promises) {
    return new MyPromise((resolve, reject) => {
      if (!promises.length) return resolve([]);
      const results = [];
      let remaining = promises.length;
      promises.forEach((p, i) => {
        MyPromise.resolve(p).then(val => {
          results[i] = val;
          if (--remaining === 0) resolve(results);
        }, reject);
      });
    });
  }

  static allSettled(promises) {
    return MyPromise.all(promises.map(p =>
      MyPromise.resolve(p)
        .then(value  => ({ status: "fulfilled", value }))
        .catch(reason => ({ status: "rejected",  reason }))
    ));
  }

  static race(promises) {
    return new MyPromise((resolve, reject) => {
      promises.forEach(p => MyPromise.resolve(p).then(resolve, reject));
    });
  }

  static any(promises) {
    return new MyPromise((resolve, reject) => {
      const errors = [];
      let remaining = promises.length;
      if (!remaining) return reject(new AggregateError([], "All promises rejected"));
      promises.forEach((p, i) => {
        MyPromise.resolve(p).then(resolve, err => {
          errors[i] = err;
          if (--remaining === 0) reject(new AggregateError(errors, "All promises rejected"));
        });
      });
    });
  }
}

// Test
const p = new MyPromise((resolve) => setTimeout(() => resolve(42), 100));
p.then(v => console.log(v)); // 42

// ─── Promise Combinators ──────────────────────────────────────────────────
const delay = (ms, val) => new Promise(res => setTimeout(() => res(val), ms));
const fail  = (ms, err) => new Promise((_, rej) => setTimeout(() => rej(err), ms));

// Promise.all — all must succeed; fails fast on first rejection
Promise.all([delay(100, "a"), delay(200, "b"), delay(50, "c")])
  .then(results => console.log(results)); // ["a", "b", "c"]

// Promise.allSettled — waits for all, doesn't fail fast
Promise.allSettled([delay(100, "ok"), fail(50, "oops")])
  .then(results => console.log(results));
// [{status:"fulfilled",value:"ok"},{status:"rejected",reason:"oops"}]

// Promise.race — resolves/rejects with first settled
Promise.race([delay(300, "slow"), delay(50, "fast")])
  .then(winner => console.log(winner)); // "fast"

// Promise.any — resolves with first fulfilled; rejects if ALL reject
Promise.any([fail(50, "err1"), delay(100, "second"), fail(150, "err3")])
  .then(v => console.log(v)); // "second"

// ─── Async/Await Patterns ────────────────────────────────────────────────
async function fetchUser(id) {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Sequential (slow — each waits for previous)
async function sequential() {
  const user1 = await fetchUser(1);
  const user2 = await fetchUser(2); // waits for user1
  return [user1, user2];
}

// Parallel (fast — both kick off simultaneously)
async function parallel() {
  const [user1, user2] = await Promise.all([fetchUser(1), fetchUser(2)]);
  return [user1, user2];
}

// ─── Async error handling ────────────────────────────────────────────────
async function robustFetch(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      if (i === retries - 1) throw e; // rethrow on last attempt
      await delay(2 ** i * 1000);     // exponential backoff
      console.log(`Retry ${i + 1}...`);
    }
  }
}

// ─── Async iterator / for-await-of ───────────────────────────────────────
async function* paginate(url) {
  let page = 1;
  while (true) {
    const res = await fetch(`${url}?page=${page}`);
    const data = await res.json();
    if (!data.items.length) break;
    yield data.items;
    page++;
  }
}

async function collectAll(url) {
  const all = [];
  for await (const page of paginate(url)) {
    all.push(...page);
  }
  return all;
}
```

---

## 9. Generators & Iterators

### Q11: Explain Generators. What problems do they solve?

```javascript
// ─── Basic Generator ─────────────────────────────────────────────────────
function* counter(start = 0, step = 1) {
  let current = start;
  while (true) {
    const reset = yield current; // yield pauses; reset = value passed to next()
    if (reset) {
      current = start;
    } else {
      current += step;
    }
  }
}

const gen = counter(0, 5);
console.log(gen.next());       // { value: 0,  done: false }
console.log(gen.next());       // { value: 5,  done: false }
console.log(gen.next());       // { value: 10, done: false }
console.log(gen.next(true));   // { value: 0,  done: false } — reset!
console.log(gen.next());       // { value: 5,  done: false }

// ─── Finite Generator ────────────────────────────────────────────────────
function* range(start, end, step = 1) {
  for (let i = start; i < end; i += step) {
    yield i;
  }
}

console.log([...range(0, 10, 2)]); // [0, 2, 4, 6, 8]

for (const n of range(1, 4)) {
  console.log(n); // 1, 2, 3
}

// ─── Lazy Evaluation — only compute what's needed ────────────────────────
function* naturals() {
  let n = 1;
  while (true) yield n++;
}

function* take(n, iterable) {
  let count = 0;
  for (const item of iterable) {
    if (count++ >= n) return;
    yield item;
  }
}

function* filter(pred, iterable) {
  for (const item of iterable) {
    if (pred(item)) yield item;
  }
}

function* map(fn, iterable) {
  for (const item of iterable) yield fn(item);
}

// Compose lazy pipelines — no arrays created!
const evenSquares = take(5,
  map(x => x * x,
    filter(x => x % 2 === 0,
      naturals())));

console.log([...evenSquares]); // [4, 16, 36, 64, 100]

// ─── Generator as State Machine ──────────────────────────────────────────
function* trafficLight() {
  while (true) {
    yield "🔴 RED   — Stop";
    yield "🟡 YELLOW — Prepare";
    yield "🟢 GREEN  — Go";
  }
}

const light = trafficLight();
console.log(light.next().value); // 🔴 RED   — Stop
console.log(light.next().value); // 🟡 YELLOW — Prepare
console.log(light.next().value); // 🟢 GREEN  — Go
console.log(light.next().value); // 🔴 RED   — Stop (loops)

// ─── Making custom objects iterable ──────────────────────────────────────
class Range {
  constructor(start, end) {
    this.start = start;
    this.end   = end;
  }

  // Symbol.iterator makes the class iterable
  [Symbol.iterator]() {
    let current = this.start;
    const end   = this.end;
    return {
      next() {
        if (current <= end) {
          return { value: current++, done: false };
        }
        return { value: undefined, done: true };
      }
    };
  }
}

const r = new Range(1, 5);
console.log([...r]);      // [1, 2, 3, 4, 5]
console.log(Math.max(...r)); // 5
const [first, , third] = r; // destructuring works too
console.log(first, third);  // 1, 3

// ─── Generator delegation with yield* ────────────────────────────────────
function* flatten(arr) {
  for (const item of arr) {
    if (Array.isArray(item)) {
      yield* flatten(item); // delegate to recursive generator
    } else {
      yield item;
    }
  }
}

const nested = [1, [2, [3, 4], 5], 6];
console.log([...flatten(nested)]); // [1, 2, 3, 4, 5, 6]
```

---

## 10. Currying & Partial Application

### Q12: Implement a universal curry function.

```javascript
// ─── Manual currying ─────────────────────────────────────────────────────
const add = a => b => c => a + b + c;
console.log(add(1)(2)(3)); // 6

// ─── Universal curry (handles any arity) ─────────────────────────────────
function curry(fn) {
  const arity = fn.length; // number of expected arguments

  return function curried(...args) {
    if (args.length >= arity) {
      return fn.apply(this, args); // enough args — call original
    }
    // Not enough args — return a function collecting more
    return function (...moreArgs) {
      return curried.apply(this, args.concat(moreArgs));
    };
  };
}

function volume(l, w, h) { return l * w * h; }

const curriedVolume = curry(volume);

console.log(curriedVolume(2)(3)(4));    // 24
console.log(curriedVolume(2, 3)(4));    // 24
console.log(curriedVolume(2)(3, 4));    // 24
console.log(curriedVolume(2, 3, 4));    // 24

// Practical use — partial application via currying
const multiply = curry((a, b) => a * b);
const double   = multiply(2);
const triple   = multiply(3);

console.log([1,2,3,4,5].map(double)); // [2, 4, 6, 8, 10]
console.log([1,2,3,4,5].map(triple)); // [3, 6, 9, 12, 15]

// ─── Partial Application ─────────────────────────────────────────────────
function partial(fn, ...presetArgs) {
  return function (...laterArgs) {
    return fn.apply(this, [...presetArgs, ...laterArgs]);
  };
}

function greet(greeting, punctuation, name) {
  return `${greeting}, ${name}${punctuation}`;
}

const hello  = partial(greet, "Hello", "!");
const goodbye = partial(greet, "Goodbye", ".");

console.log(hello("Alice"));   // "Hello, Alice!"
console.log(goodbye("Bob"));   // "Goodbye, Bob."

// ─── Compose & Pipe ──────────────────────────────────────────────────────
const compose = (...fns) => x => fns.reduceRight((v, f) => f(v), x);
const pipe    = (...fns) => x => fns.reduce((v, f) => f(v), x);

const transform = pipe(
  x => x * 2,          // 10
  x => x + 3,          // 13
  x => x.toString(),   // "13"
  s => s.padStart(5)   // "   13"
);

console.log(transform(5)); // "   13"

// Real-world example — data processing pipeline
const processUsers = pipe(
  users => users.filter(u => u.active),
  users => users.map(u => ({ ...u, name: u.name.toUpperCase() })),
  users => users.sort((a, b) => a.name.localeCompare(b.name))
);
```

---

## 11. Memoization

### Q13: Implement memoize with support for multiple arguments.

```javascript
// ─── Simple memoize ──────────────────────────────────────────────────────
function memoize(fn) {
  const cache = new Map();

  return function (...args) {
    const key = JSON.stringify(args); // works for primitive args
    if (cache.has(key)) {
      console.log(`Cache hit for: ${key}`);
      return cache.get(key);
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

const expensiveFib = memoize(function fib(n) {
  if (n <= 1) return n;
  return expensiveFib(n - 1) + expensiveFib(n - 2);
});

console.time("fib(40)");
console.log(expensiveFib(40)); // 102334155
console.timeEnd("fib(40)");   // ~0ms with memoization vs ~1000ms without

// ─── Advanced memoize with TTL and max cache size ─────────────────────────
function memoizeAdvanced(fn, { ttl = Infinity, maxSize = 100 } = {}) {
  const cache   = new Map(); // key → { value, timestamp }
  const order   = [];        // insertion order for LRU eviction

  function evict(key) {
    cache.delete(key);
    const idx = order.indexOf(key);
    if (idx !== -1) order.splice(idx, 1);
  }

  return function (...args) {
    const key  = JSON.stringify(args);
    const now  = Date.now();
    const entry = cache.get(key);

    if (entry) {
      if (now - entry.timestamp < ttl) {
        // Move to end (most recently used)
        const idx = order.indexOf(key);
        order.splice(idx, 1);
        order.push(key);
        return entry.value;
      }
      evict(key); // TTL expired
    }

    // Evict oldest if over capacity
    while (order.length >= maxSize) {
      evict(order[0]);
    }

    const value = fn.apply(this, args);
    cache.set(key, { value, timestamp: now });
    order.push(key);
    return value;
  };
}

const cachedFetch = memoizeAdvanced(
  (url) => fetch(url).then(r => r.json()),
  { ttl: 60_000, maxSize: 50 } // cache for 1 min, max 50 entries
);
```

---

## 12. Debounce & Throttle

### Q14: Implement debounce and throttle from scratch.

```javascript
// ─── Debounce ─────────────────────────────────────────────────────────────
// Execute function only AFTER a pause in calls of 'delay' ms
// Use case: search input, resize handler, form validation

function debounce(fn, delay, { leading = false, trailing = true } = {}) {
  let timerId;
  let lastArgs;
  let lastThis;
  let leadingCalled = false;

  function invoke() {
    leadingCalled = false;
    if (trailing && lastArgs) {
      fn.apply(lastThis, lastArgs);
      lastArgs = lastThis = null;
    }
  }

  return function (...args) {
    lastArgs = args;
    lastThis = this;

    if (leading && !timerId) {
      fn.apply(this, args);
      leadingCalled = true;
    }

    clearTimeout(timerId);
    timerId = setTimeout(invoke, delay);
  };
}

// Usage:
const searchInput = debounce((query) => {
  console.log(`Searching for: ${query}`);
  // API call here
}, 300);

// searchInput("j");   // ignored — more calls coming
// searchInput("ja");  // ignored
// searchInput("jav"); // 300ms after this, fires: "Searching for: jav"

// ─── Throttle ─────────────────────────────────────────────────────────────
// Execute function AT MOST ONCE per 'limit' ms
// Use case: scroll handler, mousemove, rate-limiting API calls

function throttle(fn, limit) {
  let lastTime  = 0;
  let timerId;

  return function (...args) {
    const now     = Date.now();
    const elapsed = now - lastTime;

    if (elapsed >= limit) {
      lastTime = now;
      fn.apply(this, args);
    } else {
      // Schedule trailing call
      clearTimeout(timerId);
      timerId = setTimeout(() => {
        lastTime = Date.now();
        fn.apply(this, args);
      }, limit - elapsed);
    }
  };
}

// Usage:
const onScroll = throttle((e) => {
  console.log(`Scroll position: ${window.scrollY}`);
}, 100); // fires at most every 100ms

// window.addEventListener('scroll', onScroll);

// ─── Visual comparison ────────────────────────────────────────────────────
// Typing: a, b, c, d, e (each 100ms apart), delay/limit = 300ms
//
// Debounce: only fires 300ms after 'e' — ONE call total
// Throttle: fires at 'a' (t=0), then again at 'c' (t=300), then 'e' (trailing)
```

---

## 13. Deep Clone

### Q15: Implement a deep clone that handles all edge cases.

```javascript
function deepClone(obj, seen = new WeakMap()) {
  // Handle primitives and null
  if (obj === null || typeof obj !== "object") return obj;

  // Handle circular references
  if (seen.has(obj)) return seen.get(obj);

  // Handle special types
  if (obj instanceof Date)   return new Date(obj.getTime());
  if (obj instanceof RegExp) return new RegExp(obj.source, obj.flags);
  if (obj instanceof Map) {
    const mapClone = new Map();
    seen.set(obj, mapClone);
    obj.forEach((val, key) => mapClone.set(deepClone(key, seen), deepClone(val, seen)));
    return mapClone;
  }
  if (obj instanceof Set) {
    const setClone = new Set();
    seen.set(obj, setClone);
    obj.forEach(val => setClone.add(deepClone(val, seen)));
    return setClone;
  }
  if (Array.isArray(obj)) {
    const arrClone = [];
    seen.set(obj, arrClone);
    obj.forEach((item, i) => { arrClone[i] = deepClone(item, seen); });
    return arrClone;
  }

  // Handle plain objects and class instances
  const clone = Object.create(Object.getPrototypeOf(obj));
  seen.set(obj, clone);

  // Copy own enumerable AND non-enumerable properties
  for (const key of Reflect.ownKeys(obj)) {
    const desc = Object.getOwnPropertyDescriptor(obj, key);
    if (desc.value !== undefined) {
      desc.value = deepClone(desc.value, seen);
    }
    Object.defineProperty(clone, key, desc);
  }

  return clone;
}

// Test circular references
const a = { x: 1 };
a.self = a;
const cloneA = deepClone(a);
console.log(cloneA.self === cloneA); // true — circular ref preserved
console.log(cloneA === a);           // false — different object

// Test various types
const complex = {
  num:    42,
  str:    "hello",
  arr:    [1, [2, 3]],
  date:   new Date("2024-01-01"),
  regex:  /hello/gi,
  map:    new Map([["key", { nested: true }]]),
  set:    new Set([1, 2, 3]),
  nested: { deep: { deeper: "value" } }
};

const cloned = deepClone(complex);
cloned.arr[1].push(99);
cloned.nested.deep.deeper = "changed";

console.log(complex.arr[1]);        // [2, 3]  — not affected
console.log(complex.nested.deep.deeper); // "value" — not affected
console.log(cloned.date instanceof Date); // true
console.log(cloned.regex instanceof RegExp); // true
```

---

## 14. Event Delegation

### Q16: What is Event Delegation? Implement it.

```javascript
// ─── Without delegation (bad for large lists) ─────────────────────────────
// document.querySelectorAll('.btn').forEach(btn => {
//   btn.addEventListener('click', handleClick); // 100 buttons = 100 listeners
// });

// ─── With delegation (one listener handles all) ────────────────────────────
class EventDelegator {
  constructor(container) {
    this.container = typeof container === "string"
      ? document.querySelector(container)
      : container;
    this.handlers = new Map(); // selector → [handlers]
  }

  on(eventType, selector, handler) {
    if (!this.handlers.has(selector)) {
      this.handlers.set(selector, []);
    }
    this.handlers.get(selector).push(handler);

    // Single listener on container
    if (!this._listenerAdded) {
      this.container.addEventListener(eventType, this._dispatch.bind(this));
      this._listenerAdded = true;
    }
    return this;
  }

  _dispatch(event) {
    const target = event.target;
    this.handlers.forEach((handlers, selector) => {
      // Check if target or any ancestor matches the selector
      const match = target.closest(selector);
      if (match && this.container.contains(match)) {
        handlers.forEach(handler => handler.call(match, event, match));
      }
    });
  }
}

// Usage (in browser):
/*
const list = new EventDelegator('#todo-list');

list
  .on('click', '.delete-btn', (e, el) => {
    el.closest('.todo-item').remove();
  })
  .on('click', '.complete-btn', (e, el) => {
    el.closest('.todo-item').classList.toggle('done');
  })
  .on('click', '.edit-btn', (e, el) => {
    const item = el.closest('.todo-item');
    item.querySelector('.text').contentEditable = true;
  });

// Works for dynamically added items too!
list.insertAdjacentHTML('beforeend', '<li class="todo-item">New Item <button class="delete-btn">×</button></li>');
*/

// ─── Custom EventEmitter (Node.js style) ─────────────────────────────────
class EventEmitter {
  #events = new Map();

  on(event, listener) {
    if (!this.#events.has(event)) this.#events.set(event, []);
    this.#events.get(event).push(listener);
    return this; // chainable
  }

  once(event, listener) {
    const wrapper = (...args) => {
      listener.apply(this, args);
      this.off(event, wrapper);
    };
    wrapper._original = listener;
    return this.on(event, wrapper);
  }

  off(event, listener) {
    const listeners = this.#events.get(event);
    if (!listeners) return this;
    const filtered = listeners.filter(
      l => l !== listener && l._original !== listener
    );
    if (filtered.length) this.#events.set(event, filtered);
    else                  this.#events.delete(event);
    return this;
  }

  emit(event, ...args) {
    const listeners = this.#events.get(event) || [];
    listeners.forEach(listener => listener.apply(this, args));
    return this;
  }

  listenerCount(event) {
    return (this.#events.get(event) || []).length;
  }
}

const emitter = new EventEmitter();

emitter.on("data",  d => console.log("Listener 1:", d));
emitter.once("data", d => console.log("Once listener:", d));
emitter.on("error", e => console.error("Error:", e));

emitter.emit("data", "hello"); // Both listeners fire
emitter.emit("data", "world"); // Only listener 1 fires (once removed itself)
```

---

## 15. WeakMap, WeakSet & Memory Management

### Q17: When should you use WeakMap/WeakSet over Map/Set?

```javascript
// ─── WeakMap — keys must be objects; doesn't prevent GC ─────────────────
const cache    = new WeakMap();
const metadata = new WeakMap();

class Request {
  constructor(url) { this.url = url; }
}

const req1 = new Request("/api/users");

// Associate metadata without modifying the object
metadata.set(req1, { timestamp: Date.now(), retries: 0 });

console.log(metadata.get(req1)); // { timestamp: ..., retries: 0 }

// When req1 goes out of scope (or is set to null),
// the GC can collect req1 AND the metadata automatically!
// This is impossible with a regular Map (would keep strong reference)

// ─── Private class fields alternative (before # syntax) ───────────────────
const _private = new WeakMap();

class Person {
  constructor(name, age) {
    _private.set(this, { name, age, _secret: "shhh" });
  }

  get name() { return _private.get(this).name; }
  get age()  { return _private.get(this).age; }

  birthday() {
    _private.get(this).age++;
  }

  toString() {
    const { name, age } = _private.get(this);
    return `Person(${name}, ${age})`;
  }
}

const alice = new Person("Alice", 30);
console.log(alice.name);       // "Alice"
console.log(alice._secret);    // undefined — truly private
alice.birthday();
console.log(alice.toString()); // "Person(Alice, 31)"

// ─── WeakSet — track objects without preventing collection ────────────────
const processed = new WeakSet();

function processNode(node) {
  if (processed.has(node)) {
    return; // Skip already-processed nodes
  }
  processed.add(node);
  // ... do work
  console.log("Processing:", node.id);
}

// Use case: marking DOM nodes as "seen" without creating memory leaks
// When the DOM node is removed, WeakSet doesn't keep it alive

// ─── Memory Leak Example (Map vs WeakMap) ────────────────────────────────
// BAD — Map keeps strong reference; elements never GC'd
const domCache = new Map();
function cacheElement(el) {
  domCache.set(el, computeExpensive(el));
  // If el is removed from DOM, Map still holds reference → LEAK!
}

// GOOD — WeakMap allows GC when el is removed
const domCacheWeak = new WeakMap();
function cacheElementSafe(el) {
  domCacheWeak.set(el, computeExpensive(el));
  // When el removed from DOM → WeakMap entry is GC'd automatically
}

function computeExpensive(el) {
  return { width: 100, height: 200 }; // simulated expensive computation
}
```

---

## 16. Symbol & Well-Known Symbols

### Q18: What are Symbols? What are well-known Symbols?

```javascript
// ─── Basic Symbols — always unique ───────────────────────────────────────
const sym1 = Symbol("description");
const sym2 = Symbol("description");
console.log(sym1 === sym2); // false — always unique!

// ─── Symbol.for — global registry ────────────────────────────────────────
const s1 = Symbol.for("shared");
const s2 = Symbol.for("shared");
console.log(s1 === s2);          // true — same symbol
console.log(Symbol.keyFor(s1));  // "shared"

// ─── Symbols as unique property keys ─────────────────────────────────────
const ID     = Symbol("id");
const SECRET = Symbol("secret");

const user = {
  name: "Alice",
  [ID]:     123,
  [SECRET]: "top-secret"
};

console.log(user[ID]);       // 123
console.log(user.name);      // "Alice"

// Symbols are NOT enumerable in standard loops
console.log(Object.keys(user));        // ["name"] — no symbols!
console.log(JSON.stringify(user));     // {"name":"Alice"} — symbols omitted

// But can be retrieved:
console.log(Object.getOwnPropertySymbols(user)); // [Symbol(id), Symbol(secret)]
console.log(Reflect.ownKeys(user)); // ["name", Symbol(id), Symbol(secret)]

// ─── Well-Known Symbols ───────────────────────────────────────────────────

// Symbol.iterator — make anything iterable
class Fibonacci {
  constructor(limit) { this.limit = limit; }

  [Symbol.iterator]() {
    let [a, b] = [0, 1];
    const limit = this.limit;
    return {
      next() {
        if (a > limit) return { done: true };
        const value = a;
        [a, b] = [b, a + b];
        return { value, done: false };
      }
    };
  }
}

console.log([...new Fibonacci(100)]); // [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89]

// Symbol.toPrimitive — control type coercion
class Temperature {
  constructor(celsius) { this.celsius = celsius; }

  [Symbol.toPrimitive](hint) {
    switch (hint) {
      case "number": return this.celsius;
      case "string": return `${this.celsius}°C`;
      default:       return this.celsius;
    }
  }
}

const temp = new Temperature(100);
console.log(+temp);         // 100  (number hint)
console.log(`${temp}`);     // "100°C" (string hint)
console.log(temp + 0);      // 100  (default hint)

// Symbol.hasInstance — control instanceof
class EvenNumber {
  static [Symbol.hasInstance](value) {
    return typeof value === "number" && value % 2 === 0;
  }
}

console.log(4 instanceof EvenNumber);  // true
console.log(5 instanceof EvenNumber);  // false

// Symbol.toStringTag — control Object.prototype.toString
class Collection {
  get [Symbol.toStringTag]() { return "Collection"; }
}

const col = new Collection();
console.log(Object.prototype.toString.call(col)); // "[object Collection]"
```

---

## 17. Proxy & Reflect

### Q19: What is Proxy? Implement validation, logging, and reactive state.

```javascript
// ─── Basic Proxy ─────────────────────────────────────────────────────────
const handler = {
  get(target, prop, receiver) {
    console.log(`GET: ${prop}`);
    return Reflect.get(target, prop, receiver); // always use Reflect for correct 'this'
  },
  set(target, prop, value, receiver) {
    console.log(`SET: ${prop} = ${value}`);
    return Reflect.set(target, prop, value, receiver);
  }
};

const obj = new Proxy({ name: "Alice" }, handler);
obj.name = "Bob"; // SET: name = Bob
console.log(obj.name); // GET: name → "Bob"

// ─── Validation Proxy ────────────────────────────────────────────────────
function createValidator(target, schema) {
  return new Proxy(target, {
    set(obj, prop, value) {
      const rule = schema[prop];
      if (rule) {
        if (rule.type && typeof value !== rule.type) {
          throw new TypeError(`${prop} must be of type ${rule.type}, got ${typeof value}`);
        }
        if (rule.min !== undefined && value < rule.min) {
          throw new RangeError(`${prop} must be >= ${rule.min}`);
        }
        if (rule.max !== undefined && value > rule.max) {
          throw new RangeError(`${prop} must be <= ${rule.max}`);
        }
        if (rule.pattern && !rule.pattern.test(value)) {
          throw new Error(`${prop} does not match pattern ${rule.pattern}`);
        }
      }
      return Reflect.set(obj, prop, value);
    }
  });
}

const person = createValidator({}, {
  age:   { type: "number", min: 0, max: 150 },
  name:  { type: "string" },
  email: { type: "string", pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
});

person.name  = "Alice";      // OK
person.age   = 30;            // OK
person.email = "alice@example.com"; // OK

try { person.age = -5; }  catch (e) { console.log(e.message); } // "age must be >= 0"
try { person.age = "30"; } catch (e) { console.log(e.message); } // "age must be of type number"
try { person.email = "not-an-email"; } catch (e) { console.log(e.message); }

// ─── Reactive/Observable State ───────────────────────────────────────────
function reactive(target, onChange) {
  const subscribers = new Set();
  if (typeof onChange === "function") subscribers.add(onChange);

  function observe(obj) {
    return new Proxy(obj, {
      get(t, prop, receiver) {
        const value = Reflect.get(t, prop, receiver);
        // Recursively make nested objects reactive
        if (value && typeof value === "object") return observe(value);
        return value;
      },
      set(t, prop, value, receiver) {
        const oldValue = t[prop];
        const result   = Reflect.set(t, prop, value, receiver);
        if (oldValue !== value) {
          subscribers.forEach(fn => fn({ prop, oldValue, newValue: value, target: t }));
        }
        return result;
      }
    });
  }

  return {
    state: observe(target),
    subscribe(fn) { subscribers.add(fn); return () => subscribers.delete(fn); }
  };
}

const { state, subscribe } = reactive({ count: 0, user: { name: "Alice" } });

const unsubscribe = subscribe(({ prop, oldValue, newValue }) => {
  console.log(`Changed: ${prop}: ${oldValue} → ${newValue}`);
});

state.count++;              // "Changed: count: 0 → 1"
state.user.name = "Bob";   // "Changed: name: Alice → Bob"
unsubscribe();
state.count++;              // (no log — unsubscribed)

// ─── Proxy for method chaining / fluent API ───────────────────────────────
function createQuery(data) {
  let filtered  = [...data];
  let sortKey   = null;
  let limitNum  = Infinity;

  const handler = {
    get(target, method) {
      if (method === "result") return filtered.slice(0, limitNum);
      if (method === "where") return (pred) => {
        filtered = filtered.filter(pred);
        return new Proxy(target, handler);
      };
      if (method === "orderBy") return (key) => {
        sortKey  = key;
        filtered = [...filtered].sort((a, b) =>
          a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0
        );
        return new Proxy(target, handler);
      };
      if (method === "limit") return (n) => {
        limitNum = n;
        return new Proxy(target, handler);
      };
    }
  };

  return new Proxy({}, handler);
}

const users = [
  { name: "Charlie", age: 25 },
  { name: "Alice",   age: 30 },
  { name: "Bob",     age: 22 },
  { name: "Diana",   age: 28 },
];

const result = createQuery(users)
  .where(u => u.age >= 25)
  .orderBy("name")
  .limit(2)
  .result;

console.log(result);
// [{ name: "Alice", age: 30 }, { name: "Charlie", age: 25 }]
```

---

## 18. Design Patterns

### Q20: Implement common design patterns in JavaScript.

```javascript
// ─── 1. Singleton ─────────────────────────────────────────────────────────
class Config {
  static #instance = null;
  #settings = {};

  static getInstance() {
    if (!Config.#instance) Config.#instance = new Config();
    return Config.#instance;
  }

  set(key, value) { this.#settings[key] = value; return this; }
  get(key)        { return this.#settings[key]; }
}

const cfg1 = Config.getInstance();
const cfg2 = Config.getInstance();
cfg1.set("debug", true);
console.log(cfg2.get("debug")); // true — same instance!
console.log(cfg1 === cfg2);     // true

// ─── 2. Observer ──────────────────────────────────────────────────────────
class Store {
  #state;
  #subscribers = new Map(); // event → Set of handlers

  constructor(initialState) { this.#state = initialState; }

  getState() { return { ...this.#state }; } // immutable copy

  dispatch(action) {
    const prevState = this.#state;
    this.#state    = this.#reduce(this.#state, action);
    if (prevState !== this.#state) {
      this.#notify("change", this.#state);
    }
  }

  #reduce(state, action) {
    switch (action.type) {
      case "INCREMENT": return { ...state, count: state.count + (action.by ?? 1) };
      case "DECREMENT": return { ...state, count: state.count - (action.by ?? 1) };
      case "RESET":     return { ...state, count: 0 };
      default:          return state;
    }
  }

  subscribe(event, handler) {
    if (!this.#subscribers.has(event)) this.#subscribers.set(event, new Set());
    this.#subscribers.get(event).add(handler);
    return () => this.#subscribers.get(event).delete(handler); // unsubscribe
  }

  #notify(event, data) {
    (this.#subscribers.get(event) || new Set()).forEach(h => h(data));
  }
}

const store = new Store({ count: 0 });
const unsub = store.subscribe("change", state => console.log("State:", state));

store.dispatch({ type: "INCREMENT" });    // State: { count: 1 }
store.dispatch({ type: "INCREMENT", by: 5 }); // State: { count: 6 }
store.dispatch({ type: "RESET" });        // State: { count: 0 }
unsub();
store.dispatch({ type: "INCREMENT" });    // (no log)

// ─── 3. Factory ───────────────────────────────────────────────────────────
class NotificationFactory {
  static #types = new Map();

  static register(type, Creator) {
    this.#types.set(type, Creator);
  }

  static create(type, options) {
    const Creator = this.#types.get(type);
    if (!Creator) throw new Error(`Unknown notification type: ${type}`);
    return new Creator(options);
  }
}

class EmailNotification {
  constructor({ to, subject, body }) {
    this.to = to; this.subject = subject; this.body = body;
  }
  send() { console.log(`📧 Email to ${this.to}: ${this.subject}`); }
}

class SMSNotification {
  constructor({ phone, message }) {
    this.phone = phone; this.message = message;
  }
  send() { console.log(`📱 SMS to ${this.phone}: ${this.message}`); }
}

class PushNotification {
  constructor({ deviceId, title, body }) {
    this.deviceId = deviceId; this.title = title; this.body = body;
  }
  send() { console.log(`🔔 Push to ${this.deviceId}: ${this.title}`); }
}

NotificationFactory.register("email", EmailNotification);
NotificationFactory.register("sms",   SMSNotification);
NotificationFactory.register("push",  PushNotification);

const notif = NotificationFactory.create("email", {
  to: "user@example.com", subject: "Welcome", body: "Hello!"
});
notif.send(); // 📧 Email to user@example.com: Welcome

// ─── 4. Strategy ──────────────────────────────────────────────────────────
class Sorter {
  #strategy;

  setStrategy(strategy) { this.#strategy = strategy; return this; }

  sort(data) {
    if (!this.#strategy) throw new Error("No strategy set");
    return this.#strategy([...data]); // don't mutate original
  }
}

const strategies = {
  bubble: arr => {
    for (let i = 0; i < arr.length; i++)
      for (let j = 0; j < arr.length - i - 1; j++)
        if (arr[j] > arr[j+1]) [arr[j], arr[j+1]] = [arr[j+1], arr[j]];
    return arr;
  },
  quick: arr => {
    if (arr.length <= 1) return arr;
    const pivot = arr[arr.length >> 1];
    const left  = arr.filter(x => x < pivot);
    const mid   = arr.filter(x => x === pivot);
    const right = arr.filter(x => x > pivot);
    return [...strategies.quick(left), ...mid, ...strategies.quick(right)];
  },
  native: arr => arr.sort((a, b) => a - b)
};

const sorter = new Sorter();
const data   = [5, 3, 8, 1, 9, 2];

console.log(sorter.setStrategy(strategies.bubble).sort(data)); // [1,2,3,5,8,9]
console.log(sorter.setStrategy(strategies.quick).sort(data));  // [1,2,3,5,8,9]
```

---

## 19. Functional Programming

### Q21: Demonstrate key functional programming concepts.

```javascript
// ─── Pure Functions ───────────────────────────────────────────────────────
// IMPURE — depends on external state, has side effects
let total = 0;
function addToTotal(n) { total += n; return total; } // side effect!

// PURE — same input always gives same output, no side effects
const add = (a, b) => a + b;
const double = x => x * 2;

// ─── Immutability ─────────────────────────────────────────────────────────
// Instead of mutating, return new copies
const addItem = (arr, item) => [...arr, item];
const removeItem = (arr, index) => [...arr.slice(0, index), ...arr.slice(index + 1)];
const updateItem = (arr, index, update) => arr.map((item, i) => i === index ? { ...item, ...update } : item);

const cart = [{ id: 1, qty: 1 }, { id: 2, qty: 3 }];
const newCart = updateItem(cart, 0, { qty: 2 }); // new array!
console.log(cart[0].qty);    // 1  — original unchanged
console.log(newCart[0].qty); // 2

// ─── Higher-Order Functions ───────────────────────────────────────────────
// Functions that take or return functions

const withLogging = fn => (...args) => {
  console.log(`Calling ${fn.name} with`, args);
  const result = fn(...args);
  console.log(`Result:`, result);
  return result;
};

const loggedAdd = withLogging(add);
loggedAdd(2, 3);
// Calling add with [2, 3]
// Result: 5

// ─── Transducers — composable, efficient array transforms ────────────────
const transduce = (xf, reducer, init, coll) => {
  const transformedReducer = xf(reducer);
  return coll.reduce(transformedReducer, init);
};

const mapXf = fn => reducer => (acc, val) => reducer(acc, fn(val));
const filterXf = pred => reducer => (acc, val) => pred(val) ? reducer(acc, val) : acc;

const append = (arr, val) => [...arr, val];

const result = transduce(
  compose(filterXf(n => n % 2 === 0), mapXf(n => n * n)), // pipeline
  append,
  [],
  [1,2,3,4,5,6,7,8,9,10]
);

function compose(...fns) { return x => fns.reduceRight((v, f) => f(v), x); }

console.log(result); // [4, 16, 36, 64, 100] — even numbers, squared

// ─── Functor, Monad (Maybe) ───────────────────────────────────────────────
class Maybe {
  constructor(value) { this._value = value; }

  static of(value)     { return new Maybe(value); }
  static empty()       { return new Maybe(null); }

  isNothing() { return this._value === null || this._value === undefined; }

  map(fn) {
    return this.isNothing() ? Maybe.empty() : Maybe.of(fn(this._value));
  }

  flatMap(fn) {
    return this.isNothing() ? Maybe.empty() : fn(this._value);
  }

  getOrElse(defaultValue) {
    return this.isNothing() ? defaultValue : this._value;
  }

  toString() {
    return this.isNothing() ? "Maybe.Nothing" : `Maybe.Just(${this._value})`;
  }
}

// Safe chaining without null checks
const getUser       = id => Maybe.of({ id, profile: { name: "Alice", address: null } });
const getProfile    = user   => Maybe.of(user?.profile);
const getAddress    = profile => Maybe.of(profile?.address);
const getCity       = address => Maybe.of(address?.city);

const city = getUser(1)
  .flatMap(getProfile)
  .flatMap(getAddress)
  .flatMap(getCity)
  .getOrElse("Unknown city");

console.log(city); // "Unknown city" — gracefully handles null chain
```

---

## 20. Tricky Output Questions

### Q22: Predict the output of these tricky JavaScript snippets.

```javascript
// ─── Q1: Type coercion chaos ──────────────────────────────────────────────
console.log([] + []);        // ""   (both convert to "" then concat)
console.log({} + []);        // "[object Object]"
console.log([] + {});        // "[object Object]"
console.log(+[]);            // 0    ([] → "" → 0)
console.log(+{});            // NaN  ({} → "[object Object]" → NaN)
console.log(!"");            // true  (empty string is falsy)
console.log(!!"");           // false
console.log(null + 1);       // 1    (null coerces to 0)
console.log(undefined + 1); // NaN  (undefined coerces to NaN)
console.log("5" - 3);       // 2    (- triggers numeric conversion)
console.log("5" + 3);       // "53" (+ prefers string concatenation)
console.log(true + true);   // 2    (booleans coerce to 0/1)
console.log([] == ![]);     // true  (both coerce to 0)

// ─── Q2: var hoisting in blocks ───────────────────────────────────────────
var x = 1;
function foo() {
  if (false) {
    var x = 2; // hoisted to top of foo, but never assigned
  }
  return x;
}
console.log(foo()); // undefined (not 1! local var x hoisted as undefined)

// ─── Q3: setTimeout in loop ───────────────────────────────────────────────
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// Output: 3, 3, 3 (all print 3 — shared var i)

for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log(j), 0);
}
// Output: 0, 1, 2 (let creates new binding each iteration)

// ─── Q4: Object mutation ──────────────────────────────────────────────────
const obj = { a: 1 };
const ref = obj;        // ref points to SAME object
ref.a = 99;
console.log(obj.a);    // 99 — mutated through reference!

const obj2  = { a: 1 };
const copy  = { ...obj2 }; // shallow copy
copy.a = 99;
console.log(obj2.a);  // 1 — original unchanged (different object)

// ─── Q5: Prototype chain ──────────────────────────────────────────────────
function A() {}
function B() {}

B.prototype = Object.create(A.prototype);

const b = new B();
console.log(b instanceof B); // true
console.log(b instanceof A); // true
console.log(B.prototype.constructor === B); // false! (it's A's constructor)

// Fix: B.prototype.constructor = B;

// ─── Q6: Closure in async context ────────────────────────────────────────
async function getData() {
  let data = "initial";

  setTimeout(() => {
    data = "updated";
  }, 0);

  await new Promise(resolve => setTimeout(resolve, 10));

  return data; // "updated" (setTimeout ran first)
}

getData().then(console.log); // "updated"

// ─── Q7: Argument evaluation order ───────────────────────────────────────
let a = 0;
const fn = (x, y) => x + y;
console.log(fn(a++, a++)); // 0 + 1 = 1 (a=0 then a=1, then a=2)
console.log(a); // 2

// ─── Q8: delete operator ──────────────────────────────────────────────────
const o = { x: 1, y: 2 };
delete o.x;
console.log(o);          // { y: 2 }
console.log("x" in o);   // false

const arr = [1, 2, 3];
delete arr[1];
console.log(arr);         // [1, empty, 3] — creates "hole"!
console.log(arr.length);  // 3 (length unchanged!)
console.log(arr[1]);      // undefined

// ─── Q9: typeof checks ───────────────────────────────────────────────────
console.log(typeof null);         // "object" ← famous JS bug!
console.log(typeof undefined);    // "undefined"
console.log(typeof function(){}); // "function"
console.log(typeof []);           // "object" ← arrays are objects
console.log(typeof NaN);          // "number" ← NaN is a number!
console.log(NaN === NaN);         // false ← NaN never equals itself!
console.log(Number.isNaN(NaN));   // true ← use this instead

// ─── Q10: Arguments object ───────────────────────────────────────────────
function sum() {
  // arguments is array-like but NOT an Array!
  return Array.from(arguments).reduce((acc, n) => acc + n, 0);
}
console.log(sum(1, 2, 3, 4, 5)); // 15

// arguments doesn't exist in arrow functions:
const sumArrow = (...args) => args.reduce((a, b) => a + b, 0);
console.log(sumArrow(1, 2, 3)); // 6

// ─── Q11: Promise resolution order ───────────────────────────────────────
console.log("start");

Promise.resolve(1).then(v => { console.log("p1:", v); return 2; })
                   .then(v => console.log("p2:", v));

Promise.resolve(3).then(v => console.log("p3:", v));

setTimeout(() => console.log("timeout"), 0);

console.log("end");

// Output order:
// start
// end
// p1: 1
// p3: 3
// p2: 2
// timeout

// ─── Q12: Getter / Setter quirks ─────────────────────────────────────────
const calc = {
  _result: 0,
  get result() { return this._result; },
  set result(v) { this._result = Math.max(0, v); }, // clamp to non-negative
};

calc.result = -5;
console.log(calc.result); // 0 (clamped by setter)

calc.result = 42;
console.log(calc.result); // 42

// ─── Q13: Short-circuit evaluation ───────────────────────────────────────
let count = 0;
const inc = () => ++count;

false && inc(); // inc never called (short-circuit)
true  || inc(); // inc never called (short-circuit)

console.log(count); // 0

null  ?? "default";  // "default" (?? only for null/undefined)
0     ?? "default";  // 0         (0 is not null/undefined!)
false ?? "default";  // false     (false is not null/undefined!)
0     || "default";  // "default" (0 is falsy — different from ??)
false || "default";  // "default"

// ─── Q14: Spread and rest ─────────────────────────────────────────────────
const first = [1, 2, 3];
const second = [4, 5, 6];

console.log([...first, ...second]);       // [1,2,3,4,5,6]
console.log(Math.max(...first));          // 3
console.log([...new Set([1,1,2,2,3])]);   // [1,2,3]

function head(first, ...rest) {
  return { first, rest };
}
console.log(head(1, 2, 3, 4)); // { first: 1, rest: [2, 3, 4] }

// ─── Q15: Destructuring edge cases ───────────────────────────────────────
const { a: renamed = 10, b = 20 } = { a: 5 };
console.log(renamed); // 5 (renamed from 'a')
console.log(b);       // 20 (default value since not in source)

const [x = 1, y = 2, ...rest2] = [10, undefined, 30, 40];
console.log(x);     // 10
console.log(y);     // 2 (undefined uses default!)
console.log(rest2); // [30, 40]

// Swap without temp:
let p = 1, q = 2;
[p, q] = [q, p];
console.log(p, q); // 2, 1
```

---

## Quick Reference Card

```javascript
// ── Memory Aids ──────────────────────────────────────────────────────────
// var   → function scoped, hoisted + initialised (undefined)
// let   → block scoped, hoisted but TDZ (not initialised)
// const → block scoped, hoisted but TDZ, must be initialised

// Microtasks > Macrotasks
// Promise.then > setTimeout (even setTimeout(fn, 0))

// this determination priority:
// new > bind > call/apply > method > global/undefined

// Falsy values:
// false, 0, -0, 0n, "", '', ``, null, undefined, NaN

// Type coercion order for +: string > number > boolean
// Type coercion for -, *, /: always numeric

// == vs ===
// === never coerces; == coerces (avoid ==)
// EXCEPTION: obj == null checks for null AND undefined

// Shallow vs Deep copy
// Object.assign / spread {...} = shallow copy
// JSON.parse(JSON.stringify(x)) = deep but loses: Date, RegExp, undefined, functions, circular refs
// structuredClone(x) = deep, handles: Date, Map, Set, circular refs

// Generator protocol: { next(), return(), throw() }
// Iterator protocol: { next() → { value, done } }

// Promise states: pending → fulfilled / rejected (immutable once settled)
// async function always returns a Promise
// await only pauses the async function, not the thread
```

---

*This document covers the most common and in-depth JavaScript interview topics. Each section includes runnable code you can test in Node.js or browser DevTools.*
