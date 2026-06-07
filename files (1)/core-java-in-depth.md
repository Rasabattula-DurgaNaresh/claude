# Core Java In-Depth — Complete Guide with 100+ Interview Questions

> **18 Java source files · 10 PNG flow diagrams · 110+ Interview Q&As · Full code examples**

---

## Diagram Index

| # | File | Topic |
|---|------|-------|
| 01 | `diagrams/01_jdk_jre_jvm.png` | JDK/JRE/JVM architecture layers |
| 02 | `diagrams/02_oop_pillars.png` | Four pillars of OOP |
| 03 | `diagrams/03_string_pool.png` | String pool & heap memory |
| 04 | `diagrams/04_collections_hierarchy.png` | Full collections framework |
| 05 | `diagrams/05_exception_hierarchy.png` | Exception hierarchy + handling flow |
| 06 | `diagrams/06_thread_lifecycle.png` | Thread states + synchronization |
| 07 | `diagrams/07_java8_features.png` | Lambdas, Streams, Optional |
| 08 | `diagrams/08_hashmap_internals.png` | HashMap internal working |
| 09 | `diagrams/09_jvm_memory.png` | JVM memory areas + GC |
| 10 | `diagrams/10_design_patterns.png` | Creational, Structural, Behavioral |

---

## Project Structure

```
core-java/
├── pom.xml
├── diagrams/           ← 10 PNG flow diagrams
├── docs/               ← This guide
└── src/main/java/com/corejava/
    ├── fundamentals/   DataTypesDemo.java, OperatorsDemo.java
    ├── oop/            EncapsulationDemo.java, InheritanceDemo.java,
    │                   PolymorphismDemo.java, AbstractionDemo.java,
    │                   StaticKeywordDemo.java
    ├── strings/        StringDemo.java
    ├── arrays/         ArraysDemo.java
    ├── exceptions/     ExceptionDemo.java
    ├── collections/    CollectionsDemo.java
    ├── multithreading/ ThreadDemo.java
    ├── java8/          Java8Features.java
    ├── jvm/            JVMInternalsDemo.java
    ├── fileio/         FileIODemo.java
    ├── reflection/     ReflectionDemo.java
    ├── generics/       GenericsDemo.java
    └── patterns/       DesignPatternsDemo.java
```

**Run any demo:**
```bash
mvn compile exec:java -Dexec.mainClass="com.corejava.fundamentals.DataTypesDemo"
```

---

# SECTION 1 — Java Fundamentals

> **See diagram:** `diagrams/01_jdk_jre_jvm.png`

## JDK vs JRE vs JVM

| Tool | Full Form | Purpose | Contains |
|------|-----------|---------|----------|
| **JVM** | Java Virtual Machine | Executes bytecode | Runtime engine only |
| **JRE** | Java Runtime Environment | Run Java programs | JVM + libraries |
| **JDK** | Java Development Kit | Develop + run Java | JRE + javac + tools |

```
JDK
└── JRE
    ├── JVM
    │   ├── Class Loader Subsystem
    │   ├── Runtime Data Areas (Heap, Stack, Method Area...)
    │   └── Execution Engine (JIT + Interpreter + GC)
    └── Java Standard Libraries (java.util, java.io, java.net...)
+ javac (compiler)
+ javadoc
+ jdb (debugger)
+ jar, jshell, etc.
```

## Java Compilation Process

```
MyClass.java
    │
    ▼ javac (compiler)
MyClass.class  ← platform-independent bytecode
    │
    ▼ JVM (on any OS)
Machine Code   ← JIT compiles hot paths
    │
    ▼
Execution
```

## Primitive Data Types

| Type | Size | Range | Default |
|------|------|-------|---------|
| `byte` | 1 byte | -128 to 127 | 0 |
| `short` | 2 bytes | -32,768 to 32,767 | 0 |
| `int` | 4 bytes | -2³¹ to 2³¹-1 | 0 |
| `long` | 8 bytes | -2⁶³ to 2⁶³-1 | 0L |
| `float` | 4 bytes | 6-7 decimal digits | 0.0f |
| `double` | 8 bytes | 15 decimal digits | 0.0d |
| `char` | 2 bytes | 0 to 65,535 (Unicode) | '\u0000' |
| `boolean` | ~1 bit | true/false | false |

## Autoboxing & Integer Cache

```java
Integer a = 100;  Integer b = 100;  // a == b → TRUE  (cached -128..127)
Integer x = 200;  Integer y = 200;  // x == y → FALSE (new objects)
// ALWAYS use .equals() for Integer comparison!
```

---

# SECTION 2 — OOP Concepts

> **See diagram:** `diagrams/02_oop_pillars.png`

## The Four Pillars

### 1. Encapsulation — Data Hiding

```java
class BankAccount {
    private double balance;         // hidden
    public double getBalance()      { return balance; }
    public void deposit(double amt) {
        if (amt > 0) balance += amt; // validated
    }
}
```

**Benefits:** Data integrity, maintainability, loose coupling.

### 2. Inheritance — Code Reuse

```java
class Animal { void speak() { System.out.println("..."); } }
class Dog extends Animal {
    @Override void speak() { System.out.println("Woof!"); }
}
// Constructor chain: Child() → super() → Parent() → Object()
```

**Types:** Single, Multilevel, Hierarchical  
**Not supported:** Multiple class inheritance (diamond problem)

### 3. Polymorphism — Many Forms

```java
// Compile-time: Method Overloading (different params)
int add(int a, int b)       { return a + b; }
double add(double a, double b) { return a + b; }

// Runtime: Method Overriding (vtable dispatch)
Animal a = new Dog();
a.speak();  // calls Dog.speak() at runtime!
```

### 4. Abstraction — Hide Complexity

```java
abstract class Shape    { abstract double area(); }
interface Drawable      { void draw(); }
class Circle extends Shape implements Drawable {
    double r;
    @Override double area() { return Math.PI * r * r; }
    @Override void draw()   { System.out.println("Drawing circle"); }
}
```

**Abstract class vs Interface:**

| | Abstract Class | Interface |
|-|---------------|-----------|
| State | YES — instance variables | NO (only constants) |
| Constructor | YES | NO |
| Methods | Abstract + Concrete | Abstract + Default (Java 8+) |
| Inheritance | extends (single) | implements (multiple) |
| When to use | Partial implementation | Pure contract |

---

# SECTION 3 — Strings

> **See diagram:** `diagrams/03_string_pool.png`

## Why Strings Are Immutable

1. **Security** — passwords, file paths cannot be tampered with
2. **Caching (String Pool)** — multiple references to same object
3. **Thread Safety** — no synchronization needed
4. **HashCode caching** — consistent for use as HashMap keys

```java
// String pool — literal creates/reuses pool entry
String s1 = "Hello";
String s2 = "Hello";
s1 == s2 → true  (same pool reference)

// new keyword — bypasses pool
String s3 = new String("Hello");
s1 == s3 → false  (different objects)
s1.equals(s3) → true  (same content)

// intern() — force into pool
String s4 = s3.intern();
s1 == s4 → true
```

## String vs StringBuilder vs StringBuffer

| | String | StringBuilder | StringBuffer |
|-|--------|--------------|--------------|
| Mutable | NO | YES | YES |
| Thread-safe | YES (immutable) | NO | YES (sync) |
| Performance | Slow (new obj per op) | Fast | Slower than SB |
| Use case | Constants, keys | Single-thread ops | Multi-thread ops |

---

# SECTION 4 — Collections Framework

> **See diagram:** `diagrams/04_collections_hierarchy.png`

## Hierarchy Overview

```
Iterable
└── Collection
    ├── List (ordered, allows duplicates)
    │   ├── ArrayList    — array-based, O(1) get
    │   ├── LinkedList   — doubly-linked, O(1) add/remove at ends
    │   └── Vector       — synchronized ArrayList (legacy)
    ├── Set (no duplicates)
    │   ├── HashSet      — no order, O(1) ops
    │   ├── LinkedHashSet — insertion order
    │   └── TreeSet      — sorted, O(log n)
    └── Queue
        ├── PriorityQueue — min-heap
        └── ArrayDeque    — double-ended queue

Map (key-value pairs, NOT Collection)
├── HashMap          — no order, O(1) avg
├── LinkedHashMap    — insertion order
├── TreeMap          — sorted by key, O(log n)
├── Hashtable        — synchronized (legacy)
└── ConcurrentHashMap — thread-safe, high performance
```

## HashMap Internal Working

> **See diagram:** `diagrams/08_hashmap_internals.png`

```java
// 1. hash = key.hashCode()
// 2. spread = hash ^ (hash >>> 16)   ← reduces collision
// 3. bucket = spread & (capacity-1)  ← index into array
// 4. If bucket empty → insert Node
// 5. If key exists → update value
// 6. Collision → LinkedList chain
// 7. Chain length > 8 → Red-Black Tree (Java 8+)
// 8. size > capacity * 0.75 → resize (double capacity)

HashMap<String, Integer> map = new HashMap<>(16);  // default capacity=16
// Load factor = 0.75 means resize at 12 elements
```

## Comparable vs Comparator

```java
// Comparable — natural ordering, implemented IN the class
class Student implements Comparable<Student> {
    String name; int grade;
    @Override public int compareTo(Student other) {
        return this.name.compareTo(other.name); // sort by name
    }
}
Collections.sort(students); // uses Comparable

// Comparator — external ordering, passed separately
Comparator<Student> byGrade = Comparator.comparingInt(Student::grade);
students.sort(byGrade);                         // sort by grade
students.sort(byGrade.thenComparing(s -> s.name)); // multi-key sort
```

---

# SECTION 5 — Exception Handling

> **See diagram:** `diagrams/05_exception_hierarchy.png`

## Hierarchy

```
Throwable
├── Error (JVM-level, don't catch)
│   ├── StackOverflowError
│   ├── OutOfMemoryError
│   └── VirtualMachineError
└── Exception
    ├── Checked (must handle or declare)
    │   ├── IOException
    │   ├── SQLException
    │   └── ClassNotFoundException
    └── RuntimeException (unchecked)
        ├── NullPointerException
        ├── ArrayIndexOutOfBoundsException
        ├── IllegalArgumentException
        └── ClassCastException
```

## Key Rules

```java
// throw — action (throws the object)
throw new IllegalArgumentException("Invalid input");

// throws — declaration (must handle checked)
void readFile(String path) throws IOException { ... }

// try-with-resources — auto close (Java 7+)
try (Connection conn = DriverManager.getConnection(url);
     PreparedStatement ps = conn.prepareStatement(sql)) {
    // auto-closed even on exception
} catch (SQLException e) { ... }

// Multi-catch (Java 7+)
catch (IOException | SQLException e) { log(e); }

// Custom checked exception
class BusinessException extends Exception {
    BusinessException(String msg, Throwable cause) { super(msg, cause); }
}

// Exception chaining — preserve root cause
catch (IOException e) {
    throw new BusinessException("Service failed", e);
}
```

---

# SECTION 6 — Multithreading & Concurrency

> **See diagram:** `diagrams/06_thread_lifecycle.png`

## Thread States

```
NEW → RUNNABLE → BLOCKED (waiting for lock)
              ↘ WAITING (wait(), join())
              ↘ TIMED_WAITING (sleep(ms), wait(ms))
              ↘ TERMINATED
```

## Thread Safety Tools

```java
// 1. synchronized — monitor lock
synchronized void increment() { count++; } // method
synchronized(lock) { count++; }             // block

// 2. volatile — visibility (no caching)
volatile boolean running = true;

// 3. AtomicInteger — lock-free CAS
AtomicInteger count = new AtomicInteger(0);
count.incrementAndGet();                    // atomic!

// 4. ReentrantLock — flexible locking
Lock lock = new ReentrantLock(true);       // fair
lock.lock();
try { /* critical section */ }
finally { lock.unlock(); }

// 5. BlockingQueue — producer-consumer
BlockingQueue<T> q = new ArrayBlockingQueue<>(100);
q.put(item);   // blocks when full
q.take();      // blocks when empty
```

## Executor Framework

```java
// Fixed thread pool
ExecutorService pool = Executors.newFixedThreadPool(4);
Future<Integer> f = pool.submit(() -> compute());
int result = f.get();   // blocks until ready
pool.shutdown();

// CompletableFuture (Java 8+)
CompletableFuture.supplyAsync(() -> fetchUser())
    .thenApply(user -> enrichUser(user))
    .thenAccept(System.out::println)
    .exceptionally(ex -> null);
```

## Deadlock Prevention

```java
// Always acquire locks in SAME ORDER
// Use tryLock() with timeout
// Minimize lock scope
// Prefer concurrent utilities over raw sync
```

---

# SECTION 7 — Java 8+ Features

> **See diagram:** `diagrams/07_java8_features.png`

## Lambda Expressions

```java
// Old way
Runnable r = new Runnable() { public void run() { doWork(); } };

// Lambda
Runnable r = () -> doWork();
Comparator<String> c = (a, b) -> a.compareTo(b);
```

## Functional Interfaces

| Interface | Signature | Use |
|-----------|-----------|-----|
| `Predicate<T>` | `T → boolean` | filter() |
| `Function<T,R>` | `T → R` | map() |
| `Consumer<T>` | `T → void` | forEach() |
| `Supplier<T>` | `() → T` | generate() |
| `BiFunction<T,U,R>` | `(T,U) → R` | combine two values |

## Stream API Pipeline

```java
list.stream()              // source
    .filter(x -> x > 0)   // intermediate (lazy)
    .map(x -> x * 2)       // intermediate (lazy)
    .sorted()               // intermediate (stateful)
    .collect(toList());     // terminal (triggers execution)

// Useful collectors
Collectors.toList()
Collectors.toSet()
Collectors.joining(", ")
Collectors.groupingBy(Person::getDept)
Collectors.counting()
Collectors.averagingDouble(Person::getSalary)
```

## Optional — Null Safety

```java
Optional<String> opt = Optional.ofNullable(maybeNull);
opt.isPresent()                     // check
opt.get()                           // get (throws if empty)
opt.orElse("default")               // safe get
opt.orElseGet(() -> compute())      // lazy default
opt.map(String::toUpperCase)        // transform safely
opt.filter(s -> s.length() > 3)     // filter
opt.ifPresent(System.out::println)  // side effect
```

---

# SECTION 8 — JVM Internals

> **See diagram:** `diagrams/09_jvm_memory.png`

## JVM Memory Areas

| Area | Thread | Content |
|------|--------|---------|
| **Heap** | Shared | Objects, arrays, String pool |
| **Stack** | Per-thread | Stack frames, local vars, references |
| **Method Area** | Shared | Class metadata, static vars, bytecode |
| **PC Register** | Per-thread | Current instruction address |
| **Native Stack** | Per-thread | Native (C/C++) method calls |
| **Code Cache** | Shared | JIT-compiled native code |

## Heap Generations

```
Young Generation (Eden + S0 + S1) — Minor GC (fast, frequent)
     ↓ (survived 15 GC cycles)
Old Generation (Tenured) — Major GC (slow, infrequent)
     ↓
Metaspace (since Java 8, replaces PermGen) — class metadata
```

## Garbage Collectors

| GC | Java | Use Case |
|----|------|----------|
| Serial GC | All | Single-threaded, small heaps |
| Parallel GC | 8 default | Throughput priority |
| G1 GC | 9+ default | Balanced throughput + latency |
| ZGC | 11+ | Ultra-low pause (<10ms) |
| Shenandoah | 12+ | Low-pause alternative |

---

# SECTION 9 — Design Patterns

> **See diagram:** `diagrams/10_design_patterns.png`

## Creational Patterns

```java
// Singleton (Bill Pugh — thread safe, lazy)
class Singleton {
    private Singleton() {}
    private static class H { static final Singleton I = new Singleton(); }
    public static Singleton get() { return H.I; }
}

// Factory Method
interface Animal { void speak(); }
class AnimalFactory {
    static Animal create(String type) {
        return switch(type) {
            case "dog" -> new Dog();
            case "cat" -> new Cat();
            default    -> throw new IllegalArgumentException(type);
        };
    }
}

// Builder (fluent API)
HttpRequest req = new HttpRequest.Builder("POST", url)
    .header("Content-Type", "application/json")
    .body("{...}")
    .timeout(5000)
    .build();
```

## Behavioral Patterns

```java
// Strategy — swap algorithm at runtime
interface SortStrategy { void sort(int[]); }
class Sorter {
    SortStrategy strategy;
    void sort(int[] data) { strategy.sort(data); }
}

// Observer — event notification
interface Observer { void update(String event); }
class Subject {
    List<Observer> observers = new ArrayList<>();
    void notify(String e) { observers.forEach(o -> o.update(e)); }
}

// Decorator — add behaviour at runtime
class LoggingCache implements Cache {
    Cache inner;
    @Override Object get(String key) {
        log("GET " + key);
        return inner.get(key);
    }
}
```

---

# SECTION 10 — Generics

```java
// Generic class
class Pair<A, B> {
    A first; B second;
    static <X,Y> Pair<X,Y> of(X x, Y y) { return new Pair<>(x,y); }
}

// Bounded type
<T extends Number> double sum(List<T> list) { ... }
<T extends Comparable<T> & Serializable> T max(T a, T b) { ... }

// Wildcards
// ? extends T — read only (upper bound, covariant)
double sum(List<? extends Number> list) { ... }

// ? super T — write (lower bound, contravariant)
void add(List<? super Integer> list) { list.add(1); }

// Type erasure — generics removed at compile time
List<String> → List at runtime (JVM sees no generic)
```

---

# SECTION 11 — Serialization

```java
class User implements Serializable {
    private static final long serialVersionUID = 1L; // version control
    String name;
    transient String password; // NOT serialized

    // Customize with writeObject/readObject
    private void writeObject(ObjectOutputStream oos) throws IOException { ... }
    private void readObject(ObjectInputStream ois) throws Exception { ... }
}

// Serialize
try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("user.bin"))) {
    oos.writeObject(user);
}

// Deserialize
try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream("user.bin"))) {
    User loaded = (User) ois.readObject();
}
```

---

# SECTION 12 — Reflection API

```java
// Get class
Class<?> cls = Class.forName("com.example.MyClass");
Class<?> cls = myObj.getClass();

// Inspect
cls.getDeclaredFields()      // all fields (including private)
cls.getDeclaredMethods()     // all methods (including private)
cls.getDeclaredConstructors()

// Invoke at runtime
Constructor<?> ctor = cls.getDeclaredConstructor(String.class, int.class);
Object obj = ctor.newInstance("Alice", 30);

Method method = cls.getDeclaredMethod("secret");
method.setAccessible(true);  // bypass private
method.invoke(obj);

// Access private field
Field f = cls.getDeclaredField("password");
f.setAccessible(true);
f.set(obj, "newPassword");
String val = (String) f.get(obj);

// Read annotations
MyAnnotation ann = cls.getAnnotation(MyAnnotation.class);
```

---

# 100+ Interview Questions & Answers

## Java Basics (Q1–Q10)

**Q1. What is Java?**
General-purpose, object-oriented, platform-independent programming language. Compiles to bytecode that runs on JVM — "Write Once, Run Anywhere."

**Q2. Why is Java platform independent?**
Java source code compiles to bytecode (.class), not native machine code. JVM on each OS interprets/JIT-compiles this bytecode. Same .class runs on Windows, Linux, Mac.

**Q3. What is JVM, JRE, JDK?**
- JVM: executes bytecode (just the engine)
- JRE: JVM + class libraries (to run Java programs)
- JDK: JRE + compiler + tools (to develop Java programs)

**Q4. What is bytecode?**
Platform-independent intermediate representation generated by javac. Contains instructions for JVM, not native CPU. JIT compiler converts hot paths to native code at runtime.

**Q5. What is the main() signature?**
```java
public static void main(String[] args)
// public — accessible by JVM
// static  — callable without object
// void    — no return to OS
// String[] args — command-line arguments
```

**Q6. What is autoboxing?**
Automatic conversion between primitives and wrapper classes. `Integer i = 5;` (autoboxing: int→Integer). `int x = i;` (unboxing: Integer→int). Warning: can cause NPE if wrapper is null.

**Q7. What is pass by value in Java?**
Java is ALWAYS pass by value. For primitives, value is copied. For objects, the REFERENCE value is copied — but the referenced object can still be mutated.

**Q8. Why is Java secure?**
No explicit pointers, bytecode verification, SecurityManager, ClassLoader separation, automatic memory management (no buffer overflow), strong typing.

**Q9. What is a marker interface?**
Interface with no methods, used to mark a class for special treatment. Examples: `Serializable`, `Cloneable`, `Remote`.

**Q10. What is static block?**
Runs once when class is first loaded by JVM. Used for static initialization. Runs before constructors.

---

## OOP (Q11–Q25)

**Q11. What is encapsulation?**
Binding data (fields) and methods together + restricting direct access via access modifiers (private). Data can only be accessed/modified through public methods (getters/setters) which can enforce validation.

**Q12. What is abstraction?**
Hiding implementation complexity and exposing only what's necessary. In Java: abstract classes (partial implementation) and interfaces (pure contract).

**Q13. What is inheritance?**
Mechanism where a child class acquires properties and behaviors of a parent class using `extends`. Promotes code reuse. Java supports single class inheritance (to avoid diamond problem).

**Q14. What is polymorphism?**
"Many forms." Compile-time (method overloading) and runtime (method overriding). Same method name, different behavior based on object type.

**Q15. Difference between overloading and overriding?**
| | Overloading | Overriding |
|-|------------|------------|
| When | Compile-time | Runtime |
| Class | Same class | Parent-Child |
| Return type | Can differ | Must be same (or covariant) |
| Access | Can differ | Can't be more restrictive |
| static/final | Can overload | Cannot override |

**Q16. Can we overload main()?**
Yes. `public static void main(String[] args)` is the JVM entry point, but other `main()` overloads are valid Java — just not called by JVM automatically.

**Q17. Can we override static methods?**
No. Static methods are class-level, not instance-level. You can define same-named method in child (method hiding), but it's NOT polymorphic — always the reference type's method is called.

**Q18. What is constructor chaining?**
Calling one constructor from another using `this()` (same class) or `super()` (parent class). Must be the first statement. Prevents code duplication.

**Q19. Difference between `this()` and `super()`?**
- `this()` — calls another constructor in same class
- `super()` — calls parent class constructor
Both must be first statement, can't use both in same constructor.

**Q20. What is an abstract class?**
Class that cannot be instantiated. Can have abstract methods (no body) and concrete methods. Subclasses must implement all abstract methods (or also be abstract).

**Q21. What is an interface?**
Pure contract — defines what a class must do, not how. All methods abstract by default (Java 7). Java 8+ adds default/static methods. Java 9+ adds private methods. Multiple interfaces can be implemented.

**Q22. Difference between abstract class and interface?**
(See table in Section 2 above)

**Q23. What is multiple inheritance? How does Java handle it?**
A class inheriting from multiple parents. Java doesn't allow it for classes (diamond problem). Allowed for interfaces. Java 8+ default methods can cause conflicts — resolved by overriding in implementing class.

**Q24. What is composition?**
"Has-A" relationship. A class contains reference to another class rather than inheriting from it. Preferred over inheritance for flexibility. "Favor composition over inheritance" — GoF.

**Q25. What is an immutable class?**
```java
public final class ImmutablePoint {    // 1. final class
    private final int x, y;            // 2. final fields
    ImmutablePoint(int x, int y) { this.x=x; this.y=y; } // 3. set in constructor
    public int getX() { return x; }   // 4. only getters, no setters
    // 5. defensive copy for mutable fields
}
// Examples: String, Integer, LocalDate, BigDecimal
```

---

## Strings (Q26–Q30)

**Q26. Why are strings immutable?**
Security (can't alter file paths/URLs), thread safety (no sync needed), String pool (multiple refs to same object), hashCode caching (consistent key for HashMap).

**Q27. Difference between String, StringBuilder, StringBuffer?**
String: immutable, thread-safe, slow for ops. StringBuilder: mutable, NOT thread-safe, FAST. StringBuffer: mutable, thread-safe (synchronized), slower than StringBuilder.

**Q28. What is String Constant Pool?**
Special area in heap where JVM stores string literals. When you write `"hello"`, JVM checks pool — if found, reuses it; else creates new entry. Saves memory by sharing identical strings.

**Q29. Difference between `==` and `equals()`?**
`==` compares references (memory addresses). `equals()` compares content. Always use `equals()` for String comparison. For custom classes, override `equals()` (and `hashCode()`).

**Q30. What is `intern()`?**
Forces string into pool. `new String("hello").intern()` returns the pool reference. Useful when you have many duplicate strings — intern() can save memory.

---

## Collections (Q31–Q41)

**Q31. Difference between List and Set?**
List: ordered, allows duplicates, index-based access. Set: unordered (mostly), no duplicates, no index access.

**Q32. Difference between ArrayList and LinkedList?**
| | ArrayList | LinkedList |
|-|-----------|------------|
| Structure | Dynamic array | Doubly linked list |
| get(i) | O(1) | O(n) |
| add/remove at end | O(1) amortized | O(1) |
| add/remove at middle | O(n) (shift) | O(1) if ref known |
| Memory | Less (array) | More (node + 2 pointers) |

**Q33. Difference between HashSet and TreeSet?**
HashSet: O(1) ops, no order, allows null. TreeSet: O(log n) ops, sorted (natural or Comparator), no null.

**Q34. Difference between HashMap and Hashtable?**
HashMap: not synchronized, allows null key/values, faster. Hashtable: synchronized (legacy), no null, slower. Use ConcurrentHashMap for thread-safe alternative.

**Q35. Difference between HashMap and TreeMap?**
HashMap: O(1) avg, no order. TreeMap: O(log n), sorted by key. TreeMap implements NavigableMap — floorKey(), ceilingKey(), headMap(), etc.

**Q36. How does HashMap work internally?**
See `diagrams/08_hashmap_internals.png`. Key steps: hashCode() → spread → bucket index → check bucket → LinkedList/TreeNode for collision.

**Q37. What is hashing?**
Converting a key to an integer index using hash function. Good hash function: fast, uniform distribution, minimizes collisions.

**Q38. What is collision? How is it handled?**
Two keys map to same bucket. Handled by: Separate chaining (LinkedList/TreeNode — Java's approach), Open addressing (probing).

**Q39. What is fail-fast iterator?**
Throws ConcurrentModificationException if collection modified during iteration (outside iterator's own remove()). Maintained via modCount. ArrayList, HashMap iterators are fail-fast. CopyOnWriteArrayList is fail-safe.

**Q40. What is Comparable?**
Interface for natural ordering. Implemented IN the class. `compareTo()` returns negative/0/positive. Used by `Collections.sort()` and `Arrays.sort()` without explicit Comparator.

**Q41. What is Comparator?**
External ordering strategy. Passed to sort methods. Can define multiple orderings for same class. Lambda-friendly: `Comparator.comparing(Person::getAge)`.

---

## Exception Handling (Q42–Q48)

**Q42. What is exception handling?**
Mechanism to handle runtime errors gracefully using try-catch-finally. Separates error-handling code from business logic. Enables recovery from unexpected situations.

**Q43. Difference between checked and unchecked exceptions?**
Checked: extends Exception, must be handled or declared (`throws`). Examples: IOException, SQLException. Unchecked: extends RuntimeException, optional handling. Examples: NPE, ArrayIndexOutOfBounds.

**Q44. Difference between throw and throws?**
`throw`: actually throws exception object. `throws`: declares method may throw checked exception (contract for callers).

**Q45. What is finally block?**
Executes always (exception or not, return or not). Used for cleanup: closing files, releasing locks. Exception: `System.exit()` prevents finally from running.

**Q46. What is a custom exception?**
User-defined exception extending Exception (checked) or RuntimeException (unchecked). Add context-specific fields and messages for better error handling.

**Q47. What is try-with-resources?**
Java 7+. Automatically closes resources implementing `AutoCloseable`. Cleaner alternative to finally block for resource cleanup.

**Q48. Difference between Error and Exception?**
Error: JVM-level, unrecoverable (StackOverflowError, OutOfMemoryError). Don't catch. Exception: program-level, often recoverable. Can and should handle.

---

## Multithreading (Q49–Q60)

**Q49. What is a thread?**
Lightweight execution unit within a process. Shares heap memory, code, and static data with other threads. Has its own stack, PC register. Enables concurrent execution.

**Q50. Difference between process and thread?**
Process: independent program, own memory. Thread: lightweight unit within process, shared memory. Threads are faster to create, communicate via shared memory (need synchronization).

**Q51. Ways to create a thread?**
1. Extend Thread class (override run())
2. Implement Runnable (pass to Thread)
3. Lambda expression: `new Thread(() -> task()).start()`
4. Callable + Future via ExecutorService
5. CompletableFuture for async tasks

**Q52. What is synchronization?**
Mechanism to ensure only one thread accesses critical section at a time. Uses monitor/intrinsic locks. Prevents race conditions. Methods: `synchronized` keyword, `ReentrantLock`.

**Q53. What is deadlock?**
Two threads permanently blocked, each waiting for a lock held by the other. Requires: mutual exclusion + hold-and-wait + no preemption + circular wait. Prevention: lock ordering, tryLock with timeout.

**Q54. What is a race condition?**
Multiple threads access shared data without sync, producing unpredictable results. Example: `count++` is not atomic (read-modify-write). Fix: sync, AtomicInteger, or volatile (for simple visibility).

**Q55. What is volatile keyword?**
Ensures visibility — writes immediately visible to all threads (no CPU cache). Does NOT ensure atomicity for compound operations (`count++` still needs sync). Prevents instruction reordering.

**Q56. Difference between wait() and sleep()?**
| | `wait()` | `sleep()` |
|-|---------|----------|
| Class | Object | Thread |
| Lock | RELEASES lock | HOLDS lock |
| Wake | notify()/notifyAll() | timeout |
| Call from | synchronized block | anywhere |

**Q57. What is a thread pool?**
Pre-allocated set of reusable threads. Avoids overhead of creating/destroying threads per task. Types: FixedThreadPool, CachedThreadPool, SingleThreadExecutor, ScheduledThreadPool.

**Q58. What is the Executor Framework?**
High-level concurrency API (Java 5+). `ExecutorService` manages thread pools. `submit()` returns `Future`. Separates task submission from execution mechanics.

**Q59. What is Callable vs Future?**
Callable: like Runnable but returns value and can throw checked exceptions. Future: handle to asynchronous result — `get()` blocks until ready, `isDone()` checks status.

**Q60. What is ConcurrentHashMap?**
Thread-safe map without full synchronization. Uses lock striping (Java 7) and CAS + node-level locking (Java 8). Much better concurrency than synchronized HashMap. Atomic operations: compute, merge, computeIfAbsent.

---

## Java 8 (Q61–Q66)

**Q61. What is a lambda expression?**
Anonymous function: compact syntax for single-method (functional) interfaces. `(params) -> body`. Enables functional programming. Requires @FunctionalInterface.

**Q62. What is a functional interface?**
Interface with exactly ONE abstract method. Can have default/static methods. Examples: Runnable, Comparator, Predicate, Function. Annotate with `@FunctionalInterface` for compiler check.

**Q63. What is Stream API?**
Functional-style operations on collections. Lazy (intermediate ops not executed until terminal). Doesn't modify source. Supports parallel processing: `list.parallelStream()`.

**Q64. Difference between map() and flatMap()?**
`map()`: 1-to-1 transformation. Returns `Stream<R>`. `flatMap()`: 1-to-many, flattens. Returns `Stream<R>` from `Stream<Stream<R>>`. Example: `listOfLists.stream().flatMap(Collection::stream)`.

**Q65. What is Optional?**
Container for possibly-null value. Forces callers to handle absence explicitly. Reduces NullPointerExceptions. Methods: `of()`, `ofNullable()`, `get()`, `orElse()`, `map()`, `filter()`, `isPresent()`.

**Q66. What are method references?**
Shorthand for lambdas calling existing methods. Types:
1. `ClassName::staticMethod`
2. `obj::instanceMethod`
3. `ClassName::instanceMethod` (first param becomes receiver)
4. `ClassName::new` (constructor reference)

---

## JVM Internals (Q67–Q75)

**Q67. What is garbage collection?**
Automatic memory reclamation. JVM periodically identifies unreachable objects (no references) and frees their heap memory. Programmer doesn't call free/delete.

**Q68. What is heap memory?**
Shared memory area where all objects are allocated. Divided into Young Generation (Eden, S0, S1) and Old Generation. GC runs here. Configured with `-Xmx` (max) and `-Xms` (initial).

**Q69. What is stack memory?**
Per-thread memory for method call frames. Each frame contains: local variables, operand stack, reference to constant pool. LIFO. Automatically managed — pushed on call, popped on return.

**Q70. Difference between heap and stack?**
Heap: shared, dynamic, GC-managed, stores objects. Stack: per-thread, fixed LIFO, stores frames, autos-managed. Stack access faster (sequential). OutOfMemoryError (heap), StackOverflowError (stack).

**Q71. What are memory leaks in Java?**
Objects that are no longer needed but still referenced, preventing GC. Common causes: static collections growing unbounded, listeners not removed, ThreadLocal not cleared. Tool: VisualVM, MAT.

**Q72. What is OutOfMemoryError?**
JVM can't allocate new object because heap is full. Possible causes: creating too many objects, memory leak, heap too small. Fix: increase heap, fix leak, use profiler.

**Q73. What is StackOverflowError?**
Thread's stack runs out of space. Usually caused by infinite/deep recursion. Fix: add base case, use iterative approach, increase stack size `-Xss`.

**Q74. What is a ClassLoader?**
Loads class files (.class) into JVM memory. Hierarchy: Bootstrap (rt.jar) → Extension → Application. Parent delegation model: ask parent first. Custom ClassLoaders enable hot deployment.

**Q75. What is JVM architecture?**
(See `diagrams/01_jdk_jre_jvm.png`) Class Loader Subsystem + Runtime Data Areas (Heap, Stack, Method Area, PC, Native Stack) + Execution Engine (Interpreter + JIT + GC) + JNI (native interface).

---

## File Handling (Q76–Q79)

**Q76. What is serialization?**
Converting object state to byte stream for storage or transmission. Class must implement `Serializable`. All fields serialized except `transient`. `serialVersionUID` for version control.

**Q77. What is deserialization?**
Reconstructing object from byte stream. `ObjectInputStream.readObject()`. `transient` fields get default values (null, 0, false).

**Q78. What is transient keyword?**
Marks field as excluded from serialization. Use for: sensitive data (passwords), derived values, non-serializable fields (like threads, sockets).

**Q79. Difference between FileReader and BufferedReader?**
FileReader: reads char by char from file (slow). BufferedReader: wraps FileReader with buffer (reads chunk at a time), much faster. Adds `readLine()` method.

---

## JDBC (Q80–Q84)

**Q80. What is JDBC?**
Java Database Connectivity — standard API for connecting Java with databases. Vendor-specific JDBC drivers implement the interfaces.

**Q81. Steps to connect database?**
```java
// 1. Load driver (auto in Java 6+)
Class.forName("com.mysql.cj.jdbc.Driver");
// 2. Get connection
Connection conn = DriverManager.getConnection(url, user, pass);
// 3. Create statement
PreparedStatement ps = conn.prepareStatement("SELECT * FROM users WHERE id=?");
// 4. Execute
ps.setInt(1, userId);
ResultSet rs = ps.executeQuery();
// 5. Process results
while (rs.next()) { System.out.println(rs.getString("name")); }
// 6. Close (use try-with-resources!)
```

**Q82. Difference between Statement and PreparedStatement?**
Statement: SQL string built at runtime, vulnerable to SQL injection, no precompilation. PreparedStatement: parameterized, precompiled, prevents SQL injection, better performance for repeated queries.

**Q83. What is ResultSet?**
Object returned by `executeQuery()`. Initially positioned before first row. `next()` moves to next row. Access columns by name or index. Types: TYPE_FORWARD_ONLY (default), TYPE_SCROLL_INSENSITIVE, TYPE_SCROLL_SENSITIVE.

**Q84. What is transaction management?**
```java
conn.setAutoCommit(false);
try {
    debit(fromAccount, amount);
    credit(toAccount, amount);
    conn.commit();   // both succeed
} catch (Exception e) {
    conn.rollback(); // both fail (atomicity)
}
```

---

## Advanced (Q85–Q97)

**Q85. What is Reflection API?**
Runtime inspection and manipulation of classes, methods, fields without compile-time knowledge. Used by frameworks (Spring, Hibernate). Can access private members. Performance overhead — use sparingly.

**Q86. What is an annotation?**
Metadata attached to code elements (class, method, field). Doesn't affect logic but can drive tools/frameworks. Built-in: @Override, @Deprecated, @FunctionalInterface. Meta-annotations: @Target, @Retention, @Inherited.

**Q87. What is a singleton class?**
Class with only one instance throughout application lifetime. Private constructor + static instance + static accessor. Thread-safe variants: synchronized, double-checked locking, Bill Pugh (inner class), enum.

**Q88. What are design patterns?**
Reusable solutions to commonly occurring problems in software design. Categorized: Creational (object creation), Structural (class composition), Behavioral (object interaction).

**Q89. What is dependency injection?**
Design pattern where dependencies are passed in rather than created inside. Reduces coupling, improves testability. Used by Spring framework. Types: constructor injection (preferred), setter injection, field injection.

**Q90. What is a wrapper class?**
Object representation of primitives. `Integer` wraps `int`, `Double` wraps `double`, etc. Needed for Collections (which only work with objects), Generics. Integer cache: -128 to 127.

**Q91. What is varargs?**
Variable number of arguments: `void print(String... args)`. Treated as array internally. Must be last parameter. Use carefully — can cause ambiguity with overloading.

**Q92. What is an enum?**
Special class for a fixed set of constants. Type-safe, can have fields/methods/constructors. Can implement interfaces. Used in switch statements. `values()` returns all, `ordinal()` returns position, `name()` returns name.

**Q93. What is instanceof in Java?**
Checks if object is instance of class/interface. Returns boolean. Java 16+: pattern matching — `if (obj instanceof String s) { s.length(); }` — combines check + cast.

---

## Coding Questions (Q98–Q110)

```java
// Q98. Reverse a String
String reverse(String s) { return new StringBuilder(s).reverse().toString(); }

// Q99. Check palindrome
boolean isPalindrome(String s) {
    int lo=0, hi=s.length()-1;
    while(lo<hi) if(s.charAt(lo++)!=s.charAt(hi--)) return false;
    return true;
}

// Q100. Factorial using recursion
long factorial(int n) { return n<=1 ? 1 : n * factorial(n-1); }

// Q101. Fibonacci
int fib(int n) { return n<=1 ? n : fib(n-1)+fib(n-2); }
// Iterative O(n) O(1):
int fibIter(int n) { int a=0,b=1; for(int i=2;i<=n;i++){int c=a+b;a=b;b=c;} return b; }

// Q102. Check prime
boolean isPrime(int n) {
    if(n<2) return false;
    for(int i=2;i<=Math.sqrt(n);i++) if(n%i==0) return false;
    return true;
}

// Q103. Find duplicates in array
Set<Integer> findDuplicates(int[] arr) {
    Set<Integer> seen=new HashSet<>(), dups=new HashSet<>();
    for(int x:arr) if(!seen.add(x)) dups.add(x);
    return dups;
}

// Q104. Sort array without built-ins (bubble sort)
void bubbleSort(int[] arr) {
    int n=arr.length;
    for(int i=0;i<n-1;i++)
        for(int j=0;j<n-i-1;j++)
            if(arr[j]>arr[j+1]){ int t=arr[j];arr[j]=arr[j+1];arr[j+1]=t; }
}

// Q105. Find second largest
int secondLargest(int[] arr) {
    int first=Integer.MIN_VALUE, second=Integer.MIN_VALUE;
    for(int x:arr) {
        if(x>first){second=first;first=x;}
        else if(x>second&&x!=first) second=x;
    }
    return second;
}

// Q106. Check anagram
boolean isAnagram(String a, String b) {
    if(a.length()!=b.length()) return false;
    int[] freq=new int[26];
    for(char c:a.toCharArray()) freq[c-'a']++;
    for(char c:b.toCharArray()) if(--freq[c-'a']<0) return false;
    return true;
}

// Q107. Find missing number (1 to n)
int missingNumber(int[] arr, int n) {
    int expected = n*(n+1)/2;
    int actual = 0; for(int x:arr) actual+=x;
    return expected-actual;
}

// Q108. Binary search
int binarySearch(int[] arr, int target) {
    int lo=0,hi=arr.length-1;
    while(lo<=hi){ int mid=lo+(hi-lo)/2;
        if(arr[mid]==target) return mid;
        else if(arr[mid]<target) lo=mid+1; else hi=mid-1; }
    return -1;
}

// Q109. Reverse linked list
ListNode reverseList(ListNode head) {
    ListNode prev=null,curr=head;
    while(curr!=null){ListNode next=curr.next;curr.next=prev;prev=curr;curr=next;}
    return prev;
}

// Q110. Detect loop in linked list (Floyd's algorithm)
boolean hasLoop(ListNode head) {
    ListNode slow=head,fast=head;
    while(fast!=null&&fast.next!=null){
        slow=slow.next; fast=fast.next.next;
        if(slow==fast) return true;
    }
    return false;
}
```

---

# Recommended Learning Path

```
Month 1: Fundamentals + OOP + Strings + Arrays + Exceptions
Month 2: Collections + Multithreading + Java 8 Features
Month 3: JVM Internals + Design Patterns + JDBC + Advanced topics
```

## Resources

- Oracle Java Documentation: docs.oracle.com/en/java
- Baeldung Java Tutorials: baeldung.com
- GeeksforGeeks Java: geeksforgeeks.org/java
- Dev.java: dev.java/learn

---

*Core Java In-Depth Guide — 18 source files, 10 diagrams, 110+ interview Q&As*
