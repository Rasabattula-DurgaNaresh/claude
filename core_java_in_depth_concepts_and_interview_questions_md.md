# Core Java In-Depth Concepts & 100+ Interview Questions

---

# Table of Contents

1. Java Fundamentals
2. OOP Concepts
3. Advanced OOP Concepts
4. Strings
5. Arrays
6. Exception Handling
7. Collections Framework
8. Multithreading & Concurrency
9. Java 8+ Features
10. JVM Internals
11. File Handling & I/O
12. JDBC
13. Networking
14. Reflection API
15. Annotations
16. Generics
17. Serialization
18. Design Patterns
19. Memory Management
20. Important APIs
21. Frequently Asked Interview Questions

---

# 1. Java Fundamentals

## Basics
- History of Java
- Features of Java
- JVM, JRE, JDK
- Java compilation process
- Bytecode
- Platform independence
- Java program structure
- main() method
- Command-line arguments

## Variables & Data Types
- Primitive data types
- Non-primitive data types
- Variables
  - Local
  - Instance
  - Static
- Type conversion
- Type casting
- Wrapper classes
- Autoboxing & unboxing

## Operators
- Arithmetic
- Relational
- Logical
- Bitwise
- Shift
- Assignment
- Ternary
- instanceof

## Control Statements
- if/else
- switch
- loops
  - for
  - while
  - do-while
  - enhanced for-loop
- break/continue
- labels

---

# 2. Object-Oriented Programming (OOP)

## Classes & Objects
- Class structure
- Object creation
- Memory allocation
- Object references

## Constructors
- Default constructor
- Parameterized constructor
- Constructor overloading
- Constructor chaining

## OOP Pillars

### Encapsulation
- Data hiding
- Getters/setters

### Inheritance
- Single inheritance
- Multilevel inheritance
- Hierarchical inheritance
- Constructor inheritance

### Polymorphism
- Compile-time polymorphism
- Runtime polymorphism
- Method overloading
- Method overriding

### Abstraction
- Abstract classes
- Abstract methods
- Interfaces

---

# 3. Advanced OOP Concepts

- this keyword
- super keyword
- final keyword
- static keyword
- static blocks
- instance blocks
- nested classes
- inner classes
- anonymous classes
- enums
- singleton class
- immutable class
- object cloning

---

# 4. Strings

## String Handling
- String creation
- String pool
- String immutability
- String methods

## Mutable Strings
- StringBuilder
- StringBuffer

## Important Concepts
- String comparison
- intern()
- encoding
- regex
- pattern matching

---

# 5. Arrays

- Single-dimensional arrays
- Multi-dimensional arrays
- Jagged arrays
- Array memory model
- Sorting arrays
- Searching arrays

---

# 6. Exception Handling

## Exception Basics
- Errors vs Exceptions
- Checked exceptions
- Unchecked exceptions

## Handling Mechanisms
- try
- catch
- finally
- throw
- throws

## Advanced Concepts
- Custom exceptions
- Exception propagation
- Nested try blocks
- try-with-resources
- Stack trace analysis

---

# 7. Collections Framework

## Core Interfaces
- Collection
- List
- Set
- Queue
- Map

## List Implementations
- ArrayList
- LinkedList
- Vector
- Stack

## Set Implementations
- HashSet
- LinkedHashSet
- TreeSet

## Queue Implementations
- PriorityQueue
- Deque
- ArrayDeque

## Map Implementations
- HashMap
- LinkedHashMap
- TreeMap
- Hashtable
- ConcurrentHashMap

## Advanced Concepts
- Hashing
- Load factor
- Buckets
- Collision handling
- Iterators
- Comparable
- Comparator
- Generics

---

# 8. Multithreading & Concurrency

## Thread Basics
- Thread lifecycle
- Thread states
- Runnable
- Thread class

## Synchronization
- synchronized methods
- synchronized blocks
- intrinsic locks

## Thread Communication
- wait()
- notify()
- notifyAll()

## Concurrency Utilities
- Executor Framework
- Thread pools
- Callable
- Future
- ForkJoinPool

## Advanced Concepts
- Deadlock
- Race condition
- Starvation
- Livelock
- volatile keyword
- atomic classes
- concurrent collections

---

# 9. Java 8+ Features

## Functional Programming
- Lambda expressions
- Functional interfaces
- Method references

## Stream API
- Streams
- filter
- map
- reduce
- collect
- flatMap

## Optional Class
- Optional usage
- Null safety

## Other Features
- Default methods
- Static interface methods
- Date & Time API
- var keyword
- Records
- Pattern matching

---

# 10. JVM Internals

## JVM Architecture
- Class loader subsystem
- Runtime data areas
- Execution engine

## Memory Areas
- Heap
- Stack
- Method area
- PC register
- Native method stack

## Garbage Collection
- GC algorithms
- Minor GC
- Major GC
- G1 GC
- CMS GC

## Class Loading
- Bootstrap loader
- Extension loader
- Application loader

---

# 11. File Handling & I/O

## Byte Streams
- InputStream
- OutputStream

## Character Streams
- Reader
- Writer

## Buffered Streams
- BufferedReader
- BufferedWriter

## File Operations
- File class
- File handling
- Serialization
- Deserialization

## NIO
- Path
- Files
- Channels
- Buffers

---

# 12. JDBC

- JDBC architecture
- JDBC drivers
- Connection handling
- Statement
- PreparedStatement
- CallableStatement
- ResultSet
- Transactions
- Batch processing
- Connection pooling

---

# 13. Networking

- Socket programming
- TCP/IP
- UDP
- URL class
- HttpURLConnection
- Client-server communication

---

# 14. Reflection API

- Class class
- Reflection methods
- Dynamic method invocation
- Accessing private members
- Annotations processing

---

# 15. Annotations

- Built-in annotations
- Custom annotations
- Meta annotations
- Runtime annotations

---

# 16. Generics

- Generic classes
- Generic methods
- Bounded types
- Wildcards
- Type erasure

---

# 17. Serialization

- Serializable interface
- transient keyword
- serialVersionUID
- Object streams

---

# 18. Design Patterns

## Creational
- Singleton
- Factory
- Builder

## Structural
- Adapter
- Decorator
- Proxy

## Behavioral
- Observer
- Strategy
- Iterator

---

# 19. Memory Management

- Heap vs Stack
- Memory leaks
- Object lifecycle
- Garbage collection tuning

---

# 20. Important APIs

- Collections API
- Stream API
- Reflection API
- Concurrency API
- NIO API
- Date & Time API

---

# 21. Core Java Interview Questions (100+)

## Java Basics
1. What is Java?
2. Why is Java platform independent?
3. What is JVM?
4. What is JRE?
5. What is JDK?
6. Difference between JDK, JRE, and JVM?
7. What is bytecode?
8. What are Java features?
9. What is the main method signature?
10. Why is Java called object-oriented?

## OOP Concepts
11. What is encapsulation?
12. What is abstraction?
13. What is inheritance?
14. What is polymorphism?
15. Difference between overloading and overriding?
16. Can we overload the main method?
17. Can we override static methods?
18. What is constructor chaining?
19. Difference between this() and super()?
20. What is an abstract class?
21. What is an interface?
22. Difference between abstract class and interface?
23. What is multiple inheritance?
24. What is composition?
25. What is immutable class?

## Strings
26. Why are strings immutable?
27. Difference between String, StringBuilder, and StringBuffer?
28. What is String Constant Pool?
29. Difference between == and equals()?
30. What is intern() method?

## Collections
31. Difference between List and Set?
32. Difference between ArrayList and LinkedList?
33. Difference between HashSet and TreeSet?
34. Difference between HashMap and Hashtable?
35. Difference between HashMap and TreeMap?
36. How does HashMap work internally?
37. What is hashing?
38. What is collision in HashMap?
39. What is fail-fast iterator?
40. What is Comparable?
41. What is Comparator?

## Exception Handling
42. What is exception handling?
43. Difference between checked and unchecked exceptions?
44. Difference between throw and throws?
45. What is finally block?
46. What is custom exception?
47. What is try-with-resources?
48. Difference between Error and Exception?

## Multithreading
49. What is a thread?
50. Difference between process and thread?
51. Ways to create thread?
52. What is synchronization?
53. What is deadlock?
54. What is race condition?
55. What is volatile keyword?
56. Difference between wait() and sleep()?
57. What is thread pool?
58. What is Executor Framework?
59. What is Callable and Future?
60. What is ConcurrentHashMap?

## Java 8+
61. What is lambda expression?
62. What is functional interface?
63. What is Stream API?
64. Difference between map() and flatMap()?
65. What is Optional?
66. What are method references?

## JVM Internals
67. What is garbage collection?
68. What is heap memory?
69. What is stack memory?
70. Difference between heap and stack?
71. What are memory leaks?
72. What is OutOfMemoryError?
73. What is StackOverflowError?
74. What is classloader?
75. What is JVM architecture?

## File Handling
76. What is serialization?
77. What is deserialization?
78. What is transient keyword?
79. Difference between FileReader and BufferedReader?

## JDBC
80. What is JDBC?
81. Steps to connect database in Java?
82. Difference between Statement and PreparedStatement?
83. What is ResultSet?
84. What is transaction management?

## Advanced Java
85. What is reflection API?
86. What is annotation?
87. What is singleton class?
88. What are design patterns?
89. What is dependency injection?
90. What is marker interface?
91. What is wrapper class?
92. What is autoboxing and unboxing?
93. What is enum?
94. What is varargs?
95. What is static block?
96. What is pass by value?
97. Why is Java secure?

## Coding Questions
98. Reverse a string.
99. Find palindrome string.
100. Find factorial using recursion.
101. Find Fibonacci series.
102. Check prime number.
103. Find duplicate elements in array.
104. Sort array without built-in methods.
105. Find second largest number.
106. Check anagram strings.
107. Find missing number in array.
108. Implement binary search.
109. Reverse linked list.
110. Detect loop in linked list.

---

# Recommended Learning Order

1. Java Basics
2. OOP Concepts
3. Strings & Arrays
4. Exception Handling
5. Collections Framework
6. Multithreading
7. Java 8 Features
8. JVM Internals
9. JDBC
10. Design Patterns
11. Advanced Concurrency
12. Performance Tuning

---

# Recommended Resources

- Oracle Java Documentation
- Baeldung Java Tutorials
- GeeksforGeeks Java Tutorials
- Dev.java Learn
- JavaTPoint

---

# End of Document

