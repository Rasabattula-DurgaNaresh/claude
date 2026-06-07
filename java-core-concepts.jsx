import { useState } from "react";

const javaTopics = [
  {
    id: "basics",
    icon: "☕",
    title: "Java Basics",
    color: "#FF6B35",
    subtopics: [
      {
        title: "Hello World & Program Structure",
        theory: `A Java program must have a class with a main method as the entry point. Java is case-sensitive, object-oriented, and platform-independent through the JVM (Java Virtual Machine).

Key Points:
• Every Java file must have a class matching the filename
• public static void main(String[] args) is the entry point
• Statements end with semicolons
• Java is compiled to bytecode (.class files)`,
        code: `public class HelloWorld {
    public static void main(String[] args) {
        // Print to console
        System.out.println("Hello, World!");
        System.out.print("No newline here ");
        System.out.printf("Formatted: %s %d%n", "Java", 2024);
    }
}`,
        output: `Hello, World!\nNo newline here Formatted: Java 2024`
      },
      {
        title: "Data Types & Variables",
        theory: `Java has two categories of data types:
• Primitive Types: byte, short, int, long, float, double, boolean, char
• Reference Types: String, Arrays, Objects, etc.

Variable Declaration: type variableName = value;
Constants: final type CONSTANT_NAME = value;`,
        code: `public class DataTypes {
    public static void main(String[] args) {
        // Primitive types
        byte   b  = 127;
        short  s  = 32767;
        int    i  = 2_147_483_647;  // underscores allowed
        long   l  = 9_223_372_036_854_775_807L;
        float  f  = 3.14f;
        double d  = 3.141592653589793;
        boolean flag = true;
        char   c  = 'A';

        // Reference type
        String name = "Java";
        final double PI = 3.14159; // constant

        System.out.println("int max: " + i);
        System.out.println("PI = " + PI);
        System.out.println("char: " + c + " = " + (int) c);

        // Type casting
        int x = (int) 9.99;   // double -> int (lossy)
        double y = 5;          // int -> double (safe)
        System.out.println("Casted: " + x + ", " + y);
    }
}`,
        output: `int max: 2147483647\nPI = 3.14159\nchar: A = 65\nCasted: 9, 5.0`
      },
      {
        title: "Operators",
        theory: `Java supports:
• Arithmetic: +, -, *, /, % (modulus)
• Relational: ==, !=, <, >, <=, >=
• Logical: &&, ||, !
• Bitwise: &, |, ^, ~, <<, >>
• Assignment: =, +=, -=, *=, /=
• Ternary: condition ? valueIfTrue : valueIfFalse`,
        code: `public class Operators {
    public static void main(String[] args) {
        int a = 10, b = 3;

        // Arithmetic
        System.out.println(a + b);  // 13
        System.out.println(a / b);  // 3 (integer division)
        System.out.println(a % b);  // 1 (remainder)

        // Pre/Post increment
        int x = 5;
        System.out.println(x++); // prints 5, then x=6
        System.out.println(++x); // x=7, then prints 7

        // Ternary operator
        int max = (a > b) ? a : b;
        System.out.println("Max: " + max); // Max: 10

        // Logical operators (short-circuit)
        boolean result = (a > 0) && (b < 10);
        System.out.println("Result: " + result); // true

        // Bitwise
        System.out.println(5 & 3);  // 1
        System.out.println(5 | 3);  // 7
        System.out.println(5 << 1); // 10 (multiply by 2)
    }
}`,
        output: `13\n3\n1\n5\n7\nMax: 10\nResult: true\n1\n7\n10`
      }
    ]
  },
  {
    id: "control",
    icon: "🔀",
    title: "Control Flow",
    color: "#4ECDC4",
    subtopics: [
      {
        title: "If-Else & Switch",
        theory: `Control flow statements alter the execution path:
• if / else if / else: conditional branching
• switch: multi-way branching (supports int, char, String, enum)
• Java 14+ enhanced switch expressions with arrow syntax`,
        code: `public class ControlFlow {
    public static void main(String[] args) {
        int score = 85;

        // Traditional if-else
        if (score >= 90) {
            System.out.println("Grade: A");
        } else if (score >= 80) {
            System.out.println("Grade: B");
        } else if (score >= 70) {
            System.out.println("Grade: C");
        } else {
            System.out.println("Grade: F");
        }

        // Switch statement
        String day = "MONDAY";
        switch (day) {
            case "MONDAY":
            case "TUESDAY":
                System.out.println("Weekday");
                break;
            case "SATURDAY":
            case "SUNDAY":
                System.out.println("Weekend");
                break;
            default:
                System.out.println("Midweek");
        }

        // Enhanced switch (Java 14+)
        String type = switch (day) {
            case "MONDAY", "FRIDAY" -> "Special Day";
            case "SATURDAY", "SUNDAY" -> "Weekend";
            default -> "Regular Day";
        };
        System.out.println(type);
    }
}`,
        output: `Grade: B\nWeekday\nSpecial Day`
      },
      {
        title: "Loops",
        theory: `Java has four loop types:
• for: when iteration count is known
• while: when condition checked before body
• do-while: body executes at least once
• for-each (enhanced for): iterate over arrays/collections

Break: exits loop. Continue: skips current iteration.`,
        code: `public class Loops {
    public static void main(String[] args) {
        // Traditional for loop
        for (int i = 1; i <= 5; i++) {
            System.out.print(i + " ");
        }
        System.out.println();

        // While loop
        int n = 10;
        while (n > 0) {
            System.out.print(n + " ");
            n -= 3;
        }
        System.out.println();

        // Do-while (runs at least once)
        int x = 0;
        do {
            System.out.print("x=" + x + " ");
            x++;
        } while (x < 3);
        System.out.println();

        // Enhanced for-each loop
        int[] nums = {2, 4, 6, 8, 10};
        int sum = 0;
        for (int num : nums) {
            sum += num;
        }
        System.out.println("Sum: " + sum);

        // Nested loops with break/continue
        outer:
        for (int i = 0; i < 3; i++) {
            for (int j = 0; j < 3; j++) {
                if (j == 2) continue; // skip j==2
                if (i == 2) break outer; // break both loops
                System.out.print("[" + i + "," + j + "] ");
            }
        }
    }
}`,
        output: `1 2 3 4 5\n10 7 4 1\nx=0 x=1 x=2\nSum: 30\n[0,0] [0,1] [1,0] [1,1]`
      }
    ]
  },
  {
    id: "arrays",
    icon: "📦",
    title: "Arrays & Strings",
    color: "#A8E6CF",
    subtopics: [
      {
        title: "Arrays",
        theory: `Arrays store fixed-size sequences of same-type elements.
• 1D Array: type[] name = new type[size];
• 2D Array: type[][] name = new type[rows][cols];
• Arrays class provides utility methods: sort, binarySearch, fill, copyOf
• Array index starts from 0; last element at length-1`,
        code: `import java.util.Arrays;

public class ArraysDemo {
    public static void main(String[] args) {
        // Declaration and initialization
        int[] arr = {5, 2, 8, 1, 9, 3};
        System.out.println("Original: " + Arrays.toString(arr));

        // Sorting
        Arrays.sort(arr);
        System.out.println("Sorted:   " + Arrays.toString(arr));

        // Binary search (array must be sorted)
        int idx = Arrays.binarySearch(arr, 8);
        System.out.println("Index of 8: " + idx);

        // 2D Array
        int[][] matrix = {
            {1, 2, 3},
            {4, 5, 6},
            {7, 8, 9}
        };

        // Print matrix
        for (int[] row : matrix) {
            System.out.println(Arrays.toString(row));
        }

        // Copy array
        int[] copy = Arrays.copyOf(arr, arr.length);
        int[] partial = Arrays.copyOfRange(arr, 1, 4);
        System.out.println("Partial: " + Arrays.toString(partial));

        // Fill
        int[] filled = new int[5];
        Arrays.fill(filled, 7);
        System.out.println("Filled: " + Arrays.toString(filled));
    }
}`,
        output: `Original: [5, 2, 8, 1, 9, 3]\nSorted:   [1, 2, 3, 5, 8, 9]\nIndex of 8: 4\n[1, 2, 3]\n[4, 5, 6]\n[7, 8, 9]\nPartial: [2, 3, 5]\nFilled: [7, 7, 7, 7, 7]`
      },
      {
        title: "String Methods",
        theory: `Strings in Java are immutable objects. The String class provides rich methods:
• length(), charAt(), indexOf(), substring()
• toUpperCase(), toLowerCase(), trim(), strip()
• contains(), startsWith(), endsWith(), matches()
• split(), replace(), replaceAll()
• StringBuilder: mutable, use for string concatenation in loops`,
        code: `public class StringDemo {
    public static void main(String[] args) {
        String s = "  Hello, Java World!  ";

        System.out.println(s.trim());           // remove whitespace
        System.out.println(s.length());         // 22
        System.out.println(s.toUpperCase());
        System.out.println(s.contains("Java")); // true
        System.out.println(s.indexOf("Java"));  // 9
        System.out.println(s.substring(9, 13)); // Java
        System.out.println(s.replace("Java", "Python"));

        // String split
        String csv = "apple,banana,cherry";
        String[] fruits = csv.split(",");
        for (String fruit : fruits) {
            System.out.print(fruit + " ");
        }
        System.out.println();

        // String comparison
        String a = "hello";
        String b = "HELLO";
        System.out.println(a.equals(b));            // false
        System.out.println(a.equalsIgnoreCase(b));  // true
        System.out.println(a.compareTo(b));         // positive (a > b)

        // StringBuilder (mutable, efficient)
        StringBuilder sb = new StringBuilder();
        for (int i = 1; i <= 5; i++) {
            sb.append(i);
            if (i < 5) sb.append("-");
        }
        System.out.println(sb.toString()); // 1-2-3-4-5
        sb.reverse();
        System.out.println(sb.toString()); // 5-4-3-2-1
    }
}`,
        output: `Hello, Java World!\n22\n  HELLO, JAVA WORLD!  \ntrue\n9\nJava\n  Hello, Python World!  \napple banana cherry\nfalse\ntrue\n32\n1-2-3-4-5\n5-4-3-2-1`
      }
    ]
  },
  {
    id: "oop",
    icon: "🏗️",
    title: "OOP Concepts",
    color: "#C9B1FF",
    subtopics: [
      {
        title: "Classes & Objects",
        theory: `A class is a blueprint; an object is an instance of a class.
• Fields (instance variables): define state
• Methods: define behavior  
• Constructors: initialize objects (same name as class, no return type)
• this keyword: refers to current object
• static: belongs to class, not instance`,
        code: `public class BankAccount {
    // Fields (encapsulated)
    private String owner;
    private double balance;
    private static int totalAccounts = 0; // class-level

    // Constructor
    public BankAccount(String owner, double initialBalance) {
        this.owner = owner;
        this.balance = initialBalance;
        totalAccounts++;
    }

    // Overloaded constructor
    public BankAccount(String owner) {
        this(owner, 0.0); // delegates to other constructor
    }

    // Methods
    public void deposit(double amount) {
        if (amount > 0) balance += amount;
    }

    public boolean withdraw(double amount) {
        if (amount > balance) {
            System.out.println("Insufficient funds!");
            return false;
        }
        balance -= amount;
        return true;
    }

    // Getters
    public double getBalance() { return balance; }
    public String getOwner()   { return owner; }
    public static int getTotalAccounts() { return totalAccounts; }

    @Override
    public String toString() {
        return owner + ": $" + String.format("%.2f", balance);
    }

    public static void main(String[] args) {
        BankAccount acc1 = new BankAccount("Alice", 1000.0);
        BankAccount acc2 = new BankAccount("Bob");

        acc1.deposit(500);
        acc1.withdraw(200);
        acc2.deposit(750);

        System.out.println(acc1);
        System.out.println(acc2);
        System.out.println("Total accounts: " + BankAccount.getTotalAccounts());
    }
}`,
        output: `Alice: $1300.00\nBob: $750.00\nTotal accounts: 2`
      },
      {
        title: "Inheritance & Polymorphism",
        theory: `Inheritance: A subclass extends a superclass, inheriting its members.
• extends keyword for class inheritance
• super: refers to parent class
• Method overriding: subclass redefines parent method (@Override)
• Polymorphism: same interface, different implementations
• Runtime polymorphism via method overriding
• Compile-time polymorphism via method overloading`,
        code: `// Base class
class Animal {
    protected String name;
    protected int age;

    public Animal(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public void sound() {
        System.out.println(name + " makes a sound");
    }

    public String getInfo() {
        return name + " (age " + age + ")";
    }
}

// Subclass
class Dog extends Animal {
    private String breed;

    public Dog(String name, int age, String breed) {
        super(name, age); // call parent constructor
        this.breed = breed;
    }

    @Override
    public void sound() {
        System.out.println(name + " barks: Woof!");
    }

    @Override
    public String getInfo() {
        return super.getInfo() + " [" + breed + "]";
    }
}

class Cat extends Animal {
    public Cat(String name, int age) { super(name, age); }

    @Override
    public void sound() {
        System.out.println(name + " meows: Meow!");
    }
}

public class InheritanceDemo {
    public static void main(String[] args) {
        // Polymorphism: Animal reference, different objects
        Animal[] animals = {
            new Dog("Rex", 3, "Labrador"),
            new Cat("Whiskers", 5),
            new Dog("Max", 2, "Poodle")
        };

        for (Animal a : animals) {
            a.sound();           // runtime polymorphism
            System.out.println(a.getInfo());
        }

        // instanceof check
        for (Animal a : animals) {
            if (a instanceof Dog d) { // pattern matching (Java 16+)
                System.out.println(d.name + " is a dog!");
            }
        }
    }
}`,
        output: `Rex barks: Woof!\nRex (age 3) [Labrador]\nWhiskers meows: Meow!\nWhiskers (age 5)\nMax barks: Woof!\nMax (age 2) [Poodle]\nRex is a dog!\nMax is a dog!`
      },
      {
        title: "Interfaces & Abstract Classes",
        theory: `Abstract Class:
• Cannot be instantiated directly
• Can have abstract (no body) and concrete methods
• Use when sharing common implementation

Interface:
• All methods implicitly public abstract (before Java 8)
• Java 8+: default and static methods allowed
• A class can implement multiple interfaces
• Use to define contracts/capabilities`,
        code: `// Interface - defines contract
interface Drawable {
    void draw(); // abstract by default

    default String getType() { // default method
        return "Drawable Object";
    }
}

interface Resizable {
    void resize(double factor);
}

// Abstract class - partial implementation
abstract class Shape {
    protected String color;

    public Shape(String color) { this.color = color; }

    // Abstract method - must be overridden
    public abstract double area();

    // Concrete method - shared behavior
    public void displayInfo() {
        System.out.printf("%s (color=%s, area=%.2f)%n",
            getClass().getSimpleName(), color, area());
    }
}

// Concrete class implementing both
class Circle extends Shape implements Drawable, Resizable {
    private double radius;

    public Circle(String color, double radius) {
        super(color);
        this.radius = radius;
    }

    @Override public double area() { return Math.PI * radius * radius; }
    @Override public void draw()   { System.out.println("Drawing circle r=" + radius); }
    @Override public void resize(double f) { radius *= f; }
}

class Rectangle extends Shape implements Drawable {
    private double w, h;

    public Rectangle(String color, double w, double h) {
        super(color); this.w = w; this.h = h;
    }

    @Override public double area() { return w * h; }
    @Override public void draw()   { System.out.println("Drawing rect " + w + "x" + h); }
}

public class AbstractDemo {
    public static void main(String[] args) {
        Shape[] shapes = { new Circle("red", 5), new Rectangle("blue", 4, 6) };

        for (Shape s : shapes) {
            s.displayInfo();
            if (s instanceof Drawable d) d.draw();
        }

        Circle c = new Circle("green", 3);
        c.resize(2.0); // radius becomes 6
        c.displayInfo();
    }
}`,
        output: `Circle (color=red, area=78.54)\nDrawing circle r=5.0\nRectangle (color=blue, area=24.00)\nDrawing rect 4.0x6.0\nCircle (color=green, area=113.10)`
      },
      {
        title: "Encapsulation & Access Modifiers",
        theory: `Encapsulation: Bundling data and methods, hiding internal state.
Access Modifiers:
• private: only within the class
• default (no modifier): within the same package
• protected: same package + subclasses
• public: everywhere

Best Practice: Make fields private, provide public getters/setters.`,
        code: `public class Person {
    private String name;       // private field
    private int age;
    private String email;

    public Person(String name, int age, String email) {
        this.name = name;
        setAge(age);     // use setter for validation
        setEmail(email);
    }

    // Getter
    public String getName() { return name; }
    public int getAge()     { return age; }
    public String getEmail() {
        // Mask email for privacy
        int at = email.indexOf('@');
        return email.substring(0, 2) + "***" + email.substring(at);
    }

    // Setter with validation
    public void setAge(int age) {
        if (age < 0 || age > 150)
            throw new IllegalArgumentException("Invalid age: " + age);
        this.age = age;
    }

    public void setEmail(String email) {
        if (!email.contains("@"))
            throw new IllegalArgumentException("Invalid email");
        this.email = email;
    }

    public void setName(String name) {
        if (name == null || name.isBlank())
            throw new IllegalArgumentException("Name cannot be empty");
        this.name = name;
    }

    @Override
    public String toString() {
        return "Person{name='" + name + "', age=" + age +
               ", email='" + getEmail() + "'}";
    }

    public static void main(String[] args) {
        Person p = new Person("Alice", 30, "alice@example.com");
        System.out.println(p);

        p.setAge(31);
        System.out.println("Updated age: " + p.getAge());

        try {
            p.setAge(-5); // throws exception
        } catch (IllegalArgumentException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
}`,
        output: `Person{name='Alice', age=30, email='al***@example.com'}\nUpdated age: 31\nError: Invalid age: -5`
      }
    ]
  },
  {
    id: "collections",
    icon: "🗂️",
    title: "Collections",
    color: "#FFD93D",
    subtopics: [
      {
        title: "ArrayList & LinkedList",
        theory: `Java Collections Framework provides ready-to-use data structures.
ArrayList:
• Dynamic array; O(1) access, O(n) insert/delete in middle
• Best when frequent read/access

LinkedList:
• Doubly linked; O(1) insert/delete at ends, O(n) access
• Best when frequent insert/delete

Both implement List interface.`,
        code: `import java.util.*;

public class ListDemo {
    public static void main(String[] args) {
        // ArrayList
        List<String> list = new ArrayList<>();
        list.add("Apple");
        list.add("Banana");
        list.add("Cherry");
        list.add(1, "Avocado"); // insert at index

        System.out.println("List: " + list);
        System.out.println("Size: " + list.size());
        System.out.println("Get(2): " + list.get(2));
        System.out.println("Contains 'Banana': " + list.contains("Banana"));

        list.remove("Banana");
        list.remove(0);  // remove by index
        System.out.println("After remove: " + list);

        // Iterate
        for (String fruit : list) {
            System.out.print(fruit.toUpperCase() + " ");
        }
        System.out.println();

        // Sort
        Collections.sort(list);
        System.out.println("Sorted: " + list);

        // LinkedList as Deque (double-ended queue)
        Deque<Integer> deque = new LinkedList<>();
        deque.addFirst(1);
        deque.addLast(2);
        deque.addFirst(0);
        System.out.println("Deque: " + deque);
        System.out.println("PeekFirst: " + deque.peekFirst());
        System.out.println("PollLast: " + deque.pollLast());
        System.out.println("After poll: " + deque);
    }
}`,
        output: `List: [Apple, Avocado, Banana, Cherry]\nSize: 4\nGet(2): Banana\nContains 'Banana': true\nAfter remove: [Avocado, Cherry]\nAVOCADO CHERRY\nSorted: [Avocado, Cherry]\nDeque: [0, 1, 2]\nPeekFirst: 0\nPollLast: 2\nAfter poll: [0, 1]`
      },
      {
        title: "HashMap & HashSet",
        theory: `HashMap: Key-Value pairs, O(1) average for get/put, unordered.
• LinkedHashMap: maintains insertion order
• TreeMap: sorted by key (O(log n))

HashSet: Unique elements, O(1) average operations.
• LinkedHashSet: ordered insertion
• TreeSet: sorted elements`,
        code: `import java.util.*;

public class MapSetDemo {
    public static void main(String[] args) {
        // HashMap
        Map<String, Integer> scores = new HashMap<>();
        scores.put("Alice", 95);
        scores.put("Bob", 87);
        scores.put("Charlie", 92);
        scores.put("Alice", 98); // overwrites previous

        System.out.println("Scores: " + scores);
        System.out.println("Alice: " + scores.get("Alice"));
        System.out.println("Dave: " + scores.getOrDefault("Dave", 0));

        // Iterate map entries
        for (Map.Entry<String, Integer> entry : scores.entrySet()) {
            System.out.printf("%-10s -> %d%n",
                entry.getKey(), entry.getValue());
        }

        // Useful map operations
        scores.putIfAbsent("Eve", 75);
        scores.computeIfPresent("Bob", (k, v) -> v + 5);
        System.out.println("Updated: " + scores);

        // Frequency count using map
        String text = "hello world hello java world";
        Map<String, Integer> freq = new HashMap<>();
        for (String word : text.split(" ")) {
            freq.merge(word, 1, Integer::sum);
        }
        System.out.println("Word freq: " + freq);

        // HashSet
        Set<Integer> set = new HashSet<>(Arrays.asList(1,2,3,4,5));
        Set<Integer> set2 = new HashSet<>(Arrays.asList(3,4,5,6,7));

        Set<Integer> union = new HashSet<>(set);
        union.addAll(set2);
        System.out.println("Union: " + new TreeSet<>(union));

        Set<Integer> intersection = new HashSet<>(set);
        intersection.retainAll(set2);
        System.out.println("Intersection: " + new TreeSet<>(intersection));
    }
}`,
        output: `Scores: {Bob=87, Alice=98, Charlie=92}\nAlice: 98\nDave: 0\nBob        -> 87\nAlice      -> 98\nCharlie    -> 92\nUpdated: {Bob=92, Alice=98, Charlie=92, Eve=75}\nWord freq: {world=2, hello=2, java=1}\nUnion: [1, 2, 3, 4, 5, 6, 7]\nIntersection: [3, 4, 5]`
      }
    ]
  },
  {
    id: "exceptions",
    icon: "⚠️",
    title: "Exception Handling",
    color: "#FF8B94",
    subtopics: [
      {
        title: "Try-Catch-Finally",
        theory: `Exception: An event that disrupts normal program flow.
Hierarchy: Throwable → Error | Exception → RuntimeException

• Checked exceptions: must be declared or caught (IOException, etc.)
• Unchecked exceptions: RuntimeException subclasses (NPE, AIOBE)
• finally block: always executes (cleanup code)
• try-with-resources: auto-closes AutoCloseable objects`,
        code: `import java.io.*;

public class ExceptionDemo {
    // Method declaring checked exception
    public static int divide(int a, int b) {
        if (b == 0) throw new ArithmeticException("Division by zero!");
        return a / b;
    }

    public static String readFile(String path) throws IOException {
        // try-with-resources (auto-closes reader)
        try (BufferedReader reader = new BufferedReader(new FileReader(path))) {
            return reader.readLine();
        }
    }

    // Custom exception
    static class AgeException extends Exception {
        public AgeException(String msg) { super(msg); }
    }

    public static void validateAge(int age) throws AgeException {
        if (age < 0 || age > 150)
            throw new AgeException("Invalid age: " + age);
    }

    public static void main(String[] args) {
        // Basic try-catch-finally
        try {
            int result = divide(10, 2);
            System.out.println("10/2 = " + result);
            int error = divide(5, 0);  // throws exception
        } catch (ArithmeticException e) {
            System.out.println("Caught: " + e.getMessage());
        } finally {
            System.out.println("Finally always runs!");
        }

        // Multiple catch blocks
        try {
            int[] arr = new int[5];
            arr[10] = 1;           // ArrayIndexOutOfBoundsException
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("Array error: " + e.getMessage());
        } catch (Exception e) {
            System.out.println("General error: " + e.getMessage());
        }

        // Custom exception
        try {
            validateAge(200);
        } catch (AgeException e) {
            System.out.println("Age error: " + e.getMessage());
        }

        // Multi-catch (Java 7+)
        try {
            String s = null;
            s.length();            // NullPointerException
        } catch (NullPointerException | IllegalArgumentException e) {
            System.out.println("Caught NPE or IAE: " + e.getClass().getSimpleName());
        }
    }
}`,
        output: `10/2 = 5\nCaught: Division by zero!\nFinally always runs!\nArray error: Index 10 out of bounds for length 5\nAge error: Invalid age: 200\nCaught NPE or IAE: NullPointerException`
      }
    ]
  },
  {
    id: "generics",
    icon: "🔷",
    title: "Generics & Lambdas",
    color: "#98D8C8",
    subtopics: [
      {
        title: "Generics",
        theory: `Generics enable type-safe code that works with any type.
• <T> is a type parameter (convention: T=Type, E=Element, K=Key, V=Value)
• Bounded types: <T extends Number>, <? super Integer>
• Wildcard: <?> means any type
• Benefits: compile-time type safety, no casting needed`,
        code: `import java.util.*;

// Generic class
class Pair<A, B> {
    private A first;
    private B second;

    public Pair(A first, B second) {
        this.first = first;
        this.second = second;
    }

    public A getFirst()  { return first; }
    public B getSecond() { return second; }

    @Override
    public String toString() {
        return "(" + first + ", " + second + ")";
    }
}

// Generic method
class MathUtils {
    public static <T extends Comparable<T>> T max(T a, T b) {
        return a.compareTo(b) >= 0 ? a : b;
    }

    public static <T extends Number> double sum(List<T> list) {
        double total = 0;
        for (T item : list) total += item.doubleValue();
        return total;
    }
}

// Generic stack implementation
class Stack<T> {
    private List<T> items = new ArrayList<>();

    public void push(T item) { items.add(item); }

    public T pop() {
        if (items.isEmpty()) throw new RuntimeException("Stack underflow");
        return items.remove(items.size() - 1);
    }

    public T peek() { return items.get(items.size() - 1); }
    public boolean isEmpty() { return items.isEmpty(); }
    public int size() { return items.size(); }
}

public class GenericsDemo {
    public static void main(String[] args) {
        Pair<String, Integer> p = new Pair<>("Age", 25);
        System.out.println(p);
        System.out.println("First: " + p.getFirst());

        System.out.println("Max: " + MathUtils.max(3.14, 2.71));
        System.out.println("Max: " + MathUtils.max("banana", "apple"));

        List<Integer> nums = Arrays.asList(1, 2, 3, 4, 5);
        System.out.println("Sum: " + MathUtils.sum(nums));

        Stack<String> stack = new Stack<>();
        stack.push("first");
        stack.push("second");
        stack.push("third");
        System.out.println("Peek: " + stack.peek());
        System.out.println("Pop: " + stack.pop());
        System.out.println("Size: " + stack.size());
    }
}`,
        output: `(Age, 25)\nFirst: Age\nMax: 3.14\nMax: banana\nSum: 15.0\nPeek: third\nPop: third\nSize: 2`
      },
      {
        title: "Lambda & Functional Interfaces",
        theory: `Lambda expressions (Java 8+) provide concise way to implement functional interfaces.
• Functional Interface: exactly one abstract method (@FunctionalInterface)
• Built-in: Function<T,R>, Predicate<T>, Consumer<T>, Supplier<T>, BiFunction<T,U,R>
• Method references: ClassName::method
• Stream API: process collections in functional style`,
        code: `import java.util.*;
import java.util.function.*;
import java.util.stream.*;

public class LambdaDemo {
    @FunctionalInterface
    interface MathOperation {
        int operate(int a, int b);
    }

    public static void main(String[] args) {
        // Lambda expressions
        MathOperation add = (a, b) -> a + b;
        MathOperation mul = (a, b) -> a * b;
        System.out.println("Add: " + add.operate(5, 3));
        System.out.println("Mul: " + mul.operate(5, 3));

        // Built-in functional interfaces
        Predicate<Integer> isEven = n -> n % 2 == 0;
        Predicate<Integer> isPos  = n -> n > 0;
        System.out.println("isEven(4): " + isEven.test(4));
        System.out.println("isEven AND isPos(4): " + isEven.and(isPos).test(4));

        Function<String, Integer> strLen = String::length; // method ref
        Function<Integer, String> intStr = Object::toString;
        Function<String, String> composed = strLen.andThen(intStr);
        System.out.println("Length: " + composed.apply("Hello"));

        Consumer<String> printer = System.out::println;
        Supplier<List<String>> listMaker = ArrayList::new;

        // Stream API
        List<Integer> numbers = Arrays.asList(1,2,3,4,5,6,7,8,9,10);

        // Filter + Map + Collect
        List<Integer> evenSquares = numbers.stream()
            .filter(n -> n % 2 == 0)
            .map(n -> n * n)
            .collect(Collectors.toList());
        System.out.println("Even squares: " + evenSquares);

        // Reduce
        int sum = numbers.stream().reduce(0, Integer::sum);
        System.out.println("Sum: " + sum);

        // Statistics
        IntSummaryStatistics stats = numbers.stream()
            .mapToInt(Integer::intValue)
            .summaryStatistics();
        System.out.printf("Min=%d, Max=%d, Avg=%.1f%n",
            stats.getMin(), stats.getMax(), stats.getAverage());

        // Grouping
        List<String> words = Arrays.asList("apple","banana","cherry","avocado","blueberry");
        Map<Character, List<String>> grouped = words.stream()
            .collect(Collectors.groupingBy(w -> w.charAt(0)));
        grouped.forEach((k,v) -> System.out.println(k + ": " + v));
    }
}`,
        output: `Add: 8\nMul: 15\nisEven(4): true\nisEven AND isPos(4): true\nLength: 5\nEven squares: [4, 16, 36, 64, 100]\nSum: 55\nMin=1, Max=10, Avg=5.5\na: [apple, avocado]\nb: [banana, blueberry]\nc: [cherry]`
      }
    ]
  },
  {
    id: "multithreading",
    icon: "⚡",
    title: "Multithreading",
    color: "#FFA07A",
    subtopics: [
      {
        title: "Threads & Concurrency",
        theory: `Multithreading: Running multiple threads concurrently.
Ways to create threads:
1. Extend Thread class
2. Implement Runnable interface (preferred)
3. Use ExecutorService (best for thread pools)

Synchronization: prevents race conditions using synchronized keyword.
volatile: ensures visibility across threads.`,
        code: `import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class ThreadingDemo {

    // Shared counter - thread-safe using AtomicInteger
    static AtomicInteger counter = new AtomicInteger(0);

    // Runnable task
    static class CountTask implements Runnable {
        private String name;
        private int count;

        public CountTask(String name, int count) {
            this.name = name;
            this.count = count;
        }

        @Override
        public void run() {
            for (int i = 0; i < count; i++) {
                int val = counter.incrementAndGet();
                System.out.printf("[%s] Counter = %d%n", name, val);
                try { Thread.sleep(10); }
                catch (InterruptedException e) { Thread.currentThread().interrupt(); }
            }
        }
    }

    // Callable returns a result
    static class SumTask implements Callable<Long> {
        private int from, to;
        public SumTask(int from, int to) { this.from = from; this.to = to; }

        @Override
        public Long call() {
            long sum = 0;
            for (int i = from; i <= to; i++) sum += i;
            System.out.printf("Sum [%d-%d] = %d (thread: %s)%n",
                from, to, sum, Thread.currentThread().getName());
            return sum;
        }
    }

    public static void main(String[] args) throws Exception {
        // Thread pool with ExecutorService
        ExecutorService executor = Executors.newFixedThreadPool(3);

        // Submit Callable tasks
        Future<Long> f1 = executor.submit(new SumTask(1, 100));
        Future<Long> f2 = executor.submit(new SumTask(101, 200));
        Future<Long> f3 = executor.submit(new SumTask(201, 300));

        // Get results (blocks until done)
        long total = f1.get() + f2.get() + f3.get();
        System.out.println("Total sum 1-300: " + total);

        executor.shutdown();

        // Synchronized method example
        System.out.println("\\nParallel counter demo:");
        ExecutorService pool = Executors.newFixedThreadPool(2);
        counter.set(0);
        pool.submit(new CountTask("Thread-A", 3));
        pool.submit(new CountTask("Thread-B", 3));
        pool.shutdown();
        pool.awaitTermination(5, TimeUnit.SECONDS);
        System.out.println("Final counter: " + counter.get());
    }
}`,
        output: `Sum [1-100] = 5050 (thread: pool-1-thread-1)\nSum [101-200] = 15050 (thread: pool-1-thread-2)\nSum [201-300] = 25050 (thread: pool-1-thread-3)\nTotal sum 1-300: 45150\n\nParallel counter demo:\n[Thread-A] Counter = 1\n[Thread-B] Counter = 2\n[Thread-A] Counter = 3\n[Thread-B] Counter = 4\n[Thread-A] Counter = 5\n[Thread-B] Counter = 6\nFinal counter: 6`
      }
    ]
  }
];

const THEME = {
  bg: "#0A0A0F",
  surface: "#12121A",
  surfaceHover: "#1A1A28",
  border: "#2A2A3F",
  text: "#E8E8F0",
  muted: "#6B6B8A",
  accent: "#FF6B35",
};

function CodeBlock({ code, output }) {
  const [showOutput, setShowOutput] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ marginTop: 16, borderRadius: 12, overflow: "hidden", border: `1px solid ${THEME.border}` }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 16px", background: "#0D1117", borderBottom: `1px solid ${THEME.border}`
      }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["#FF5F57","#FEBC2E","#28C840"].map((c, i) => (
            <div key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />
          ))}
          <span style={{ marginLeft: 8, color: THEME.muted, fontSize: 12, fontFamily: "monospace" }}>Java</span>
        </div>
        <button onClick={handleCopy} style={{
          background: "transparent", border: `1px solid ${THEME.border}`,
          color: copied ? "#28C840" : THEME.muted, padding: "3px 10px",
          borderRadius: 6, cursor: "pointer", fontSize: 11, fontFamily: "monospace"
        }}>
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <div style={{ background: "#0D1117", padding: "16px", overflowX: "auto" }}>
        <pre style={{ margin: 0, fontFamily: "'Fira Code', 'Cascadia Code', monospace", fontSize: 13, lineHeight: 1.7, color: "#E8E8F0" }}>
          {code.split('\n').map((line, i) => (
            <div key={i} style={{ display: "flex" }}>
              <span style={{ color: "#3C3C5C", userSelect: "none", minWidth: 32, textAlign: "right", marginRight: 16, fontSize: 11 }}>{i + 1}</span>
              <span>{colorize(line)}</span>
            </div>
          ))}
        </pre>
      </div>
      {output && (
        <div>
          <button onClick={() => setShowOutput(!showOutput)} style={{
            width: "100%", background: "#161B22", border: "none",
            borderTop: `1px solid ${THEME.border}`, color: THEME.muted,
            padding: "8px 16px", cursor: "pointer", fontSize: 12,
            fontFamily: "monospace", textAlign: "left",
            transition: "background 0.2s"
          }}>
            {showOutput ? "▼ Hide Output" : "▶ Show Output"}
          </button>
          {showOutput && (
            <div style={{ background: "#0A0E17", padding: 16, borderTop: `1px solid ${THEME.border}` }}>
              <pre style={{ margin: 0, fontFamily: "monospace", fontSize: 13, color: "#28C840", lineHeight: 1.6 }}>
                {output.replace(/\\n/g, '\n')}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function colorize(line) {
  // Simple syntax highlighting
  const keywords = /\b(public|private|protected|static|final|class|interface|abstract|extends|implements|new|return|void|int|double|float|long|short|byte|boolean|char|String|if|else|for|while|do|switch|case|default|break|continue|try|catch|finally|throw|throws|import|package|this|super|null|true|false|instanceof|enum|var)\b/g;
  const strings = /(["'])(?:(?=(\\?))\2.)*?\1/g;
  const comments = /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm;
  const numbers = /\b(\d+\.?\d*[fFLd]?)\b/g;
  const annotations = /@\w+/g;

  // We'll return styled spans
  const parts = [];
  let remaining = line;
  let key = 0;

  // Simple pass: colorize keywords
  const result = line
    .replace(/(<|>|&)/g, (m) => m === '<' ? '＜' : m === '>' ? '＞' : '&amp;');

  // Return as colored text nodes
  return <ColorizedLine text={line} />;
}

function ColorizedLine({ text }) {
  const tokens = tokenize(text);
  return (
    <>
      {tokens.map((t, i) => (
        <span key={i} style={{ color: t.color }}>{t.text}</span>
      ))}
    </>
  );
}

function tokenize(text) {
  const patterns = [
    { regex: /\/\/.*$/, color: "#6B7280" },              // comment
    { regex: /"[^"]*"/, color: "#A5D6A7" },              // string
    { regex: /'[^']*'/, color: "#A5D6A7" },              // char
    { regex: /@\w+/, color: "#FFB74D" },                 // annotation
    { regex: /\b(public|private|protected|static|final|class|interface|abstract|extends|implements|new|return|void|if|else|for|while|do|switch|case|default|break|continue|try|catch|finally|throw|throws|import|package|this|super|null|true|false|instanceof|enum|var)\b/, color: "#CF6EDE" }, // keywords
    { regex: /\b(int|double|float|long|short|byte|boolean|char|String|List|Map|Set|ArrayList|HashMap|HashSet|Optional|Object)\b/, color: "#4FC3F7" }, // types
    { regex: /\b\d+\.?\d*[fFLd]?\b/, color: "#FFCC02" }, // numbers
  ];

  let result = [];
  let remaining = text;
  let pos = 0;

  while (remaining.length > 0) {
    let matched = false;
    for (const { regex, color } of patterns) {
      const m = remaining.match(regex);
      if (m && m.index === 0) {
        result.push({ text: m[0], color });
        remaining = remaining.slice(m[0].length);
        matched = true;
        break;
      } else if (m) {
        // Push plain text before match
        result.push({ text: remaining.slice(0, m.index), color: "#E8E8F0" });
        result.push({ text: m[0], color });
        remaining = remaining.slice(m.index + m[0].length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      result.push({ text: remaining[0], color: "#E8E8F0" });
      remaining = remaining.slice(1);
    }
  }

  return result;
}

export default function JavaLearningPlatform() {
  const [selectedTopic, setSelectedTopic] = useState(javaTopics[0]);
  const [selectedSubtopic, setSelectedSubtopic] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const subtopic = selectedTopic.subtopics[selectedSubtopic];

  const goNext = () => {
    if (selectedSubtopic < selectedTopic.subtopics.length - 1) {
      setSelectedSubtopic(s => s + 1);
    } else {
      const idx = javaTopics.findIndex(t => t.id === selectedTopic.id);
      if (idx < javaTopics.length - 1) {
        setSelectedTopic(javaTopics[idx + 1]);
        setSelectedSubtopic(0);
      }
    }
  };

  const goPrev = () => {
    if (selectedSubtopic > 0) {
      setSelectedSubtopic(s => s - 1);
    } else {
      const idx = javaTopics.findIndex(t => t.id === selectedTopic.id);
      if (idx > 0) {
        const prev = javaTopics[idx - 1];
        setSelectedTopic(prev);
        setSelectedSubtopic(prev.subtopics.length - 1);
      }
    }
  };

  const totalSubtopics = javaTopics.reduce((s, t) => s + t.subtopics.length, 0);
  let currentIndex = 0;
  for (const topic of javaTopics) {
    if (topic.id === selectedTopic.id) {
      currentIndex += selectedSubtopic + 1;
      break;
    }
    currentIndex += topic.subtopics.length;
  }

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100vh",
      background: THEME.bg, color: THEME.text,
      fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif",
      overflow: "hidden"
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", height: 56,
        background: THEME.surface, borderBottom: `1px solid ${THEME.border}`,
        flexShrink: 0, zIndex: 10
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setSidebarOpen(o => !o)} style={{
            background: "transparent", border: "none", color: THEME.muted,
            cursor: "pointer", fontSize: 18, padding: 4
          }}>☰</button>
          <span style={{ fontSize: 20 }}>☕</span>
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.3px" }}>
            Java Core Concepts
          </span>
          <span style={{
            background: `${selectedTopic.color}22`, color: selectedTopic.color,
            fontSize: 11, padding: "2px 8px", borderRadius: 20,
            border: `1px solid ${selectedTopic.color}44`, fontWeight: 600
          }}>
            {selectedTopic.icon} {selectedTopic.title}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: THEME.muted, fontSize: 12 }}>{currentIndex}/{totalSubtopics}</span>
          <div style={{ width: 120, height: 4, background: THEME.border, borderRadius: 2 }}>
            <div style={{
              width: `${(currentIndex / totalSubtopics) * 100}%`,
              height: "100%", background: selectedTopic.color,
              borderRadius: 2, transition: "width 0.4s ease"
            }} />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <div style={{
          width: sidebarOpen ? 260 : 0, flexShrink: 0,
          background: THEME.surface, borderRight: `1px solid ${THEME.border}`,
          overflow: "hidden", transition: "width 0.3s ease"
        }}>
          <div style={{ width: 260, overflowY: "auto", height: "100%", padding: "12px 0" }}>
            {javaTopics.map((topic) => (
              <div key={topic.id}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "8px 16px",
                  color: selectedTopic.id === topic.id ? topic.color : THEME.muted,
                  fontWeight: 600, fontSize: 12, textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>
                  <span>{topic.icon}</span>
                  <span>{topic.title}</span>
                </div>
                {topic.subtopics.map((sub, i) => {
                  const isActive = selectedTopic.id === topic.id && selectedSubtopic === i;
                  return (
                    <button key={i} onClick={() => { setSelectedTopic(topic); setSelectedSubtopic(i); }}
                      style={{
                        display: "block", width: "100%", textAlign: "left",
                        padding: "7px 16px 7px 32px",
                        background: isActive ? `${topic.color}18` : "transparent",
                        border: "none",
                        borderLeft: isActive ? `3px solid ${topic.color}` : "3px solid transparent",
                        color: isActive ? topic.color : THEME.muted,
                        fontSize: 13, cursor: "pointer",
                        transition: "all 0.15s"
                      }}>
                      {sub.title}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px" }}>
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            {/* Topic header */}
            <div style={{ marginBottom: 24 }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: `${selectedTopic.color}15`,
                border: `1px solid ${selectedTopic.color}33`,
                borderRadius: 8, padding: "4px 12px", marginBottom: 12
              }}>
                <span>{selectedTopic.icon}</span>
                <span style={{ color: selectedTopic.color, fontSize: 13, fontWeight: 600 }}>{selectedTopic.title}</span>
              </div>
              <h1 style={{
                margin: 0, fontSize: 26, fontWeight: 700,
                letterSpacing: "-0.5px", color: THEME.text
              }}>{subtopic.title}</h1>
            </div>

            {/* Theory section */}
            <div style={{
              background: THEME.surface, borderRadius: 12, padding: 24,
              border: `1px solid ${THEME.border}`, marginBottom: 20
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                marginBottom: 14, color: selectedTopic.color, fontWeight: 600, fontSize: 13
              }}>
                <span>📖</span> Theory & Concepts
              </div>
              <div style={{
                color: "#C8C8DC", lineHeight: 1.8, fontSize: 14,
                whiteSpace: "pre-line", fontFamily: "'IBM Plex Sans', sans-serif"
              }}>
                {subtopic.theory}
              </div>
            </div>

            {/* Code section */}
            <div style={{
              background: THEME.surface, borderRadius: 12, padding: 24,
              border: `1px solid ${THEME.border}`, marginBottom: 24
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                marginBottom: 8, color: "#4FC3F7", fontWeight: 600, fontSize: 13
              }}>
                <span>💻</span> Code Example
              </div>
              <CodeBlock code={subtopic.code} output={subtopic.output} />
            </div>

            {/* Navigation */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button onClick={goPrev} style={{
                background: THEME.surface, border: `1px solid ${THEME.border}`,
                color: THEME.text, padding: "10px 20px", borderRadius: 8,
                cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", gap: 8,
                transition: "border-color 0.2s"
              }}>
                ← Previous
              </button>

              <div style={{ display: "flex", gap: 6 }}>
                {selectedTopic.subtopics.map((_, i) => (
                  <div key={i} onClick={() => setSelectedSubtopic(i)} style={{
                    width: selectedSubtopic === i ? 20 : 8, height: 8,
                    borderRadius: 4,
                    background: selectedSubtopic === i ? selectedTopic.color : THEME.border,
                    cursor: "pointer", transition: "all 0.25s"
                  }} />
                ))}
              </div>

              <button onClick={goNext} style={{
                background: selectedTopic.color, border: "none",
                color: "#fff", padding: "10px 20px", borderRadius: 8,
                cursor: "pointer", fontSize: 14, fontWeight: 600,
                display: "flex", alignItems: "center", gap: 8
              }}>
                Next →
              </button>
            </div>
          </div>
        </div>

        {/* Quick Reference Panel */}
        <div style={{
          width: 220, flexShrink: 0, background: THEME.surface,
          borderLeft: `1px solid ${THEME.border}`, padding: 16, overflowY: "auto"
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.8px", color: THEME.muted, marginBottom: 14 }}>
            All Topics
          </div>
          {javaTopics.map((topic) => {
            const isActive = selectedTopic.id === topic.id;
            return (
              <button key={topic.id}
                onClick={() => { setSelectedTopic(topic); setSelectedSubtopic(0); }}
                style={{
                  display: "flex", alignItems: "center", gap: 10, width: "100%",
                  padding: "10px 12px", marginBottom: 4, borderRadius: 8,
                  background: isActive ? `${topic.color}18` : "transparent",
                  border: isActive ? `1px solid ${topic.color}44` : "1px solid transparent",
                  cursor: "pointer", textAlign: "left"
                }}>
                <span style={{ fontSize: 18 }}>{topic.icon}</span>
                <div>
                  <div style={{ color: isActive ? topic.color : THEME.text, fontSize: 13, fontWeight: 600 }}>
                    {topic.title}
                  </div>
                  <div style={{ color: THEME.muted, fontSize: 11 }}>
                    {topic.subtopics.length} lessons
                  </div>
                </div>
              </button>
            );
          })}

          <div style={{ marginTop: 20, padding: 12, background: `${THEME.bg}`, borderRadius: 8,
            border: `1px solid ${THEME.border}` }}>
            <div style={{ fontSize: 11, color: THEME.muted, marginBottom: 6 }}>QUICK FACTS</div>
            {[
              ["☕", "JDK Version", "Java 21+"],
              ["🔧", "Compile", "javac File.java"],
              ["▶", "Run", "java File"],
              ["📦", "Build", "Maven / Gradle"],
            ].map(([icon, label, val]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between",
                marginBottom: 6, fontSize: 11 }}>
                <span style={{ color: THEME.muted }}>{icon} {label}</span>
                <span style={{ color: "#4FC3F7", fontFamily: "monospace" }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
