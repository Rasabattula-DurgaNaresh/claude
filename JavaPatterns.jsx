import { useState } from "react";

const CATEGORIES = [
  { id: "stars",   label: "★ Star Patterns",    color: "#fbbf24", bg: "#451a03" },
  { id: "alpha",   label: "A Alpha Patterns",   color: "#34d399", bg: "#052e16" },
  { id: "numbers", label: "# Number Patterns",  color: "#60a5fa", bg: "#0c1a3a" },
];

const PATTERNS = {
  stars: [
    { id:"s1",  title:"Right Triangle",       desc:"Increasing stars left-aligned" },
    { id:"s2",  title:"Inverted Triangle",     desc:"Decreasing stars left-aligned" },
    { id:"s3",  title:"Pyramid",              desc:"Centered star pyramid" },
    { id:"s4",  title:"Inverted Pyramid",     desc:"Centered inverted pyramid" },
    { id:"s5",  title:"Diamond",              desc:"Full diamond shape" },
    { id:"s6",  title:"Hollow Rectangle",     desc:"Rectangle border only" },
    { id:"s7",  title:"Hollow Pyramid",       desc:"Pyramid with hollow inside" },
    { id:"s8",  title:"Hollow Diamond",       desc:"Diamond border only" },
    { id:"s9",  title:"Mirrored Triangle",    desc:"Right-aligned triangle" },
    { id:"s10", title:"Hourglass",            desc:"Inverted pyramid + pyramid" },
    { id:"s11", title:"X Pattern",            desc:"Diagonal cross of stars" },
    { id:"s12", title:"Plus Pattern",         desc:"Plus sign of stars" },
    { id:"s13", title:"Checkerboard",         desc:"Alternating star grid" },
    { id:"s14", title:"Zigzag",              desc:"Diagonal zigzag stars" },
    { id:"s15", title:"Left Triangle",        desc:"Right-aligned rising triangle" },
  ],
  alpha: [
    { id:"a1",  title:"ABC Triangle",          desc:"A AB ABC alphabets" },
    { id:"a2",  title:"Inverted Alpha Tri",    desc:"Reverse alphabet triangle" },
    { id:"a3",  title:"ABCBA Pyramid",         desc:"Symmetric alphabet pyramid" },
    { id:"a4",  title:"Mirrored Alpha Tri",    desc:"Right-aligned alpha triangle" },
    { id:"a5",  title:"Same Letter Rows",      desc:"A BB CCC DDDD pattern" },
    { id:"a6",  title:"K-Pattern Alpha",       desc:"Descending letter count rows" },
    { id:"a7",  title:"Zigzag Alphabets",      desc:"Continuous alphabet zigzag" },
    { id:"a8",  title:"Alternate Case",        desc:"Alternating upper/lowercase" },
    { id:"a9",  title:"Reverse Row Alpha",     desc:"Each row letters reversed" },
    { id:"a10", title:"Alphabet Square",       desc:"n×n alphabet grid" },
    { id:"a11", title:"Alpha Diamond",         desc:"Diamond of alphabets" },
    { id:"a12", title:"Border Alphabets",      desc:"Hollow rectangle with A-Z" },
    { id:"a13", title:"Diagonal Alphabet",     desc:"Alphabets in diagonal" },
    { id:"a14", title:"Alpha Spiral Rows",     desc:"Decreasing alphabet rows" },
    { id:"a15", title:"Alpha Right Angle",     desc:"Row letter on borders" },
  ],
  numbers: [
    { id:"n1",  title:"Number Triangle",       desc:"1 12 123 number rows" },
    { id:"n2",  title:"Inverted Number Tri",   desc:"Decreasing number triangle" },
    { id:"n3",  title:"Number Pyramid",        desc:"Centered 12321 pyramid" },
    { id:"n4",  title:"Floyd's Triangle",      desc:"Sequential numbers in rows" },
    { id:"n5",  title:"Pascal's Triangle",     desc:"Classic Pascal binomial" },
    { id:"n6",  title:"Same Number Rows",      desc:"1 22 333 4444 pattern" },
    { id:"n7",  title:"Hollow Rect Numbers",   desc:"Number border rectangle" },
    { id:"n8",  title:"Number Diamond",        desc:"Diamond filled with numbers" },
    { id:"n9",  title:"Multiplication Table",  desc:"n×n multiplication grid" },
    { id:"n10", title:"Binary Triangle",       desc:"Alternating 0s and 1s" },
    { id:"n11", title:"Palindrome Rows",       desc:"121 12321 pattern" },
    { id:"n12", title:"Right-Aligned Nums",    desc:"Right-aligned number tri" },
    { id:"n13", title:"Fibonacci Triangle",    desc:"Fibonacci numbers in rows" },
    { id:"n14", title:"Number Square",         desc:"Sequential number grid" },
    { id:"n15", title:"Sandglass Numbers",     desc:"Hourglass with numbers" },
  ],
};

function generate(id, n) {
  const L = [];
  n = Math.max(2, Math.min(n, 12));
  if (id==="s1") { for(let i=1;i<=n;i++) L.push("*".repeat(i)); }
  else if(id==="s2") { for(let i=n;i>=1;i--) L.push("*".repeat(i)); }
  else if(id==="s3") { for(let i=1;i<=n;i++) L.push(" ".repeat(n-i)+"*".repeat(2*i-1)); }
  else if(id==="s4") { for(let i=n;i>=1;i--) L.push(" ".repeat(n-i)+"*".repeat(2*i-1)); }
  else if(id==="s5") {
    for(let i=1;i<=n;i++) L.push(" ".repeat(n-i)+"*".repeat(2*i-1));
    for(let i=n-1;i>=1;i--) L.push(" ".repeat(n-i)+"*".repeat(2*i-1));
  }
  else if(id==="s6") {
    for(let i=1;i<=n;i++) {
      if(i===1||i===n) L.push("*".repeat(n));
      else L.push("*"+" ".repeat(n-2)+"*");
    }
  }
  else if(id==="s7") {
    for(let i=1;i<=n;i++) {
      let r=" ".repeat(n-i);
      if(i===1) r+="*";
      else if(i===n) r+="*".repeat(2*i-1);
      else r+="*"+" ".repeat(2*i-3)+"*";
      L.push(r);
    }
  }
  else if(id==="s8") {
    for(let i=1;i<=n;i++) { let r=" ".repeat(n-i)+(i===1?"*":"*"+" ".repeat(2*i-3)+"*"); L.push(r); }
    for(let i=n-1;i>=1;i--) { let r=" ".repeat(n-i)+(i===1?"*":"*"+" ".repeat(2*i-3)+"*"); L.push(r); }
  }
  else if(id==="s9") { for(let i=1;i<=n;i++) L.push(" ".repeat(n-i)+"*".repeat(i)); }
  else if(id==="s10") {
    for(let i=n;i>=1;i--) L.push(" ".repeat(n-i)+"*".repeat(2*i-1));
    for(let i=2;i<=n;i++) L.push(" ".repeat(n-i)+"*".repeat(2*i-1));
  }
  else if(id==="s11") {
    for(let i=1;i<=n;i++) { let r=""; for(let j=1;j<=n;j++) r+=(i===j||i+j===n+1)?"* ":"  "; L.push(r); }
  }
  else if(id==="s12") {
    const m=Math.floor(n/2);
    for(let i=0;i<n;i++) { let r=""; for(let j=0;j<n;j++) r+=(i===m||j===m)?"* ":"  "; L.push(r); }
  }
  else if(id==="s13") {
    for(let i=1;i<=n;i++) { let r=""; for(let j=1;j<=n;j++) r+=(i+j)%2===0?"* ":"  "; L.push(r); }
  }
  else if(id==="s14") {
    for(let i=1;i<=2*n-1;i++) L.push(" ".repeat(i<=n?i-1:2*n-i-1)+"*");
  }
  else if(id==="s15") {
    for(let i=1;i<=n;i++) { let r=""; for(let j=n;j>=1;j--) r+=j<=i?"* ":"  "; L.push(r); }
  }
  else if(id==="a1") { for(let i=0;i<n;i++) { let r=""; for(let j=0;j<=i;j++) r+=String.fromCharCode(65+j); L.push(r); } }
  else if(id==="a2") { for(let i=n-1;i>=0;i--) { let r=""; for(let j=0;j<=i;j++) r+=String.fromCharCode(65+j); L.push(r); } }
  else if(id==="a3") {
    for(let i=0;i<n;i++) {
      let r=" ".repeat(n-i-1);
      for(let j=0;j<=i;j++) r+=String.fromCharCode(65+j);
      for(let j=i-1;j>=0;j--) r+=String.fromCharCode(65+j);
      L.push(r);
    }
  }
  else if(id==="a4") { for(let i=0;i<n;i++) { let r=" ".repeat(n-i-1); for(let j=0;j<=i;j++) r+=String.fromCharCode(65+j); L.push(r); } }
  else if(id==="a5") { for(let i=0;i<n;i++) L.push(String.fromCharCode(65+i).repeat(i+1)); }
  else if(id==="a6") { for(let i=0;i<n;i++) { let r=""; for(let j=0;j<n-i;j++) r+=String.fromCharCode(65+i); L.push(r); } }
  else if(id==="a7") {
    let ch=65;
    for(let i=1;i<=n;i++) { let r=""; for(let j=0;j<i;j++) { r+=String.fromCharCode(ch); ch=ch<90?ch+1:65; } L.push(r); }
  }
  else if(id==="a8") {
    for(let i=1;i<=n;i++) { let r=""; for(let j=0;j<i;j++) { const c=String.fromCharCode(65+j); r+=(i+j)%2===0?c:c.toLowerCase(); } L.push(r); }
  }
  else if(id==="a9") { for(let i=0;i<n;i++) { let r=""; for(let j=i;j>=0;j--) r+=String.fromCharCode(65+j); L.push(r); } }
  else if(id==="a10") {
    for(let i=0;i<n;i++) { let r=""; for(let j=0;j<n;j++) r+=String.fromCharCode(65+(i*n+j)%26)+" "; L.push(r); }
  }
  else if(id==="a11") {
    for(let i=1;i<=n;i++) { let r=" ".repeat(n-i); for(let j=1;j<=i;j++) r+=String.fromCharCode(64+j)+" "; L.push(r); }
    for(let i=n-1;i>=1;i--) { let r=" ".repeat(n-i); for(let j=1;j<=i;j++) r+=String.fromCharCode(64+j)+" "; L.push(r); }
  }
  else if(id==="a12") {
    let ch=65;
    for(let i=0;i<n;i++) {
      let r="";
      for(let j=0;j<n;j++) {
        if(i===0||i===n-1||j===0||j===n-1) { r+=String.fromCharCode(ch)+" "; ch=ch<90?ch+1:65; }
        else r+="  ";
      }
      L.push(r);
    }
  }
  else if(id==="a13") { for(let i=0;i<n;i++) L.push("  ".repeat(i)+String.fromCharCode(65+i)); }
  else if(id==="a14") { for(let i=0;i<n;i++) { let r=""; for(let j=i;j<n;j++) r+=String.fromCharCode(65+j); L.push(r); } }
  else if(id==="a15") {
    for(let i=0;i<n;i++) {
      let r="";
      for(let j=0;j<n;j++) r+=(i===0||i===n-1||j===0)?String.fromCharCode(65+i)+" ":"  ";
      L.push(r);
    }
  }
  else if(id==="n1") { for(let i=1;i<=n;i++) { let r=""; for(let j=1;j<=i;j++) r+=j; L.push(r); } }
  else if(id==="n2") { for(let i=n;i>=1;i--) { let r=""; for(let j=1;j<=i;j++) r+=j; L.push(r); } }
  else if(id==="n3") {
    for(let i=1;i<=n;i++) {
      let r=" ".repeat(n-i);
      for(let j=1;j<=i;j++) r+=j;
      for(let j=i-1;j>=1;j--) r+=j;
      L.push(r);
    }
  }
  else if(id==="n4") { let num=1; for(let i=1;i<=n;i++) { let r=""; for(let j=1;j<=i;j++) r+=num+++(j<i?" ":""); L.push(r); } }
  else if(id==="n5") {
    for(let i=0;i<n;i++) {
      let row=[], val=1; row.push(""+val);
      for(let j=1;j<=i;j++) { val=val*(i-j+1)/j; row.push(""+Math.round(val)); }
      L.push(" ".repeat((n-i)*2)+row.join("  "));
    }
  }
  else if(id==="n6") { for(let i=1;i<=n;i++) { let r=""; for(let j=0;j<i;j++) r+=i; L.push(r); } }
  else if(id==="n7") {
    for(let i=1;i<=n;i++) {
      let r="";
      for(let j=1;j<=n;j++) {
        if(i===1||i===n) r+=j+" ";
        else if(j===1||j===n) r+=i+" ";
        else r+="  ";
      }
      L.push(r);
    }
  }
  else if(id==="n8") {
    for(let i=1;i<=n;i++) { let r=" ".repeat(n-i); for(let j=1;j<=2*i-1;j++) r+=i+" "; L.push(r.trimEnd()); }
    for(let i=n-1;i>=1;i--) { let r=" ".repeat(n-i); for(let j=1;j<=2*i-1;j++) r+=i+" "; L.push(r.trimEnd()); }
  }
  else if(id==="n9") {
    let hdr="    "; for(let j=1;j<=n;j++) hdr+=(j+"").padStart(3);
    L.push(hdr);
    L.push("   "+"-".repeat(n*3+2));
    for(let i=1;i<=n;i++) { let r=(i+"").padStart(2)+" |"; for(let j=1;j<=n;j++) r+=(i*j+"").padStart(3); L.push(r); }
  }
  else if(id==="n10") {
    for(let i=1;i<=n;i++) { let r=""; for(let j=1;j<=i;j++) r+=((i+j)%2===0?"1":"0")+" "; L.push(r); }
  }
  else if(id==="n11") {
    for(let i=1;i<=n;i++) {
      let r=" ".repeat(n-i);
      for(let j=1;j<=i;j++) r+=j;
      for(let j=i-1;j>=1;j--) r+=j;
      L.push(r);
    }
  }
  else if(id==="n12") { for(let i=1;i<=n;i++) { let r=" ".repeat(n-i); for(let j=1;j<=i;j++) r+=j+" "; L.push(r); } }
  else if(id==="n13") {
    let a=0,b=1;
    for(let i=1;i<=n;i++) { let r=""; for(let j=0;j<i;j++) { r+=b+" "; let t=a+b; a=b; b=t; } L.push(r); }
  }
  else if(id==="n14") {
    for(let i=1;i<=n;i++) { let r=""; for(let j=1;j<=n;j++) r+=((i-1)*n+j+"").padStart(3)+" "; L.push(r); }
  }
  else if(id==="n15") {
    for(let i=n;i>=1;i--) { let r=" ".repeat(n-i); for(let j=1;j<=2*i-1;j++) r+=i+" "; L.push(r.trimEnd()); }
    for(let i=2;i<=n;i++) { let r=" ".repeat(n-i); for(let j=1;j<=2*i-1;j++) r+=i+" "; L.push(r.trimEnd()); }
  }
  return L;
}

const JAVA_CODES = {
  s1: (n) => `// Pattern: Right Triangle Stars
public class RightTriangle {
    public static void main(String[] args) {
        int n = ${n};
        // Outer loop: controls number of rows
        for (int i = 1; i <= n; i++) {
            // Inner loop: prints i stars in row i
            for (int j = 1; j <= i; j++) {
                System.out.print("*");
            }
            System.out.println(); // move to next line
        }
    }
}
/* Output (n=5):
   *
   **
   ***
   ****
   ***** */`,

  s2: (n) => `// Pattern: Inverted Right Triangle Stars
public class InvertedTriangle {
    public static void main(String[] args) {
        int n = ${n};
        // Outer loop: starts from n, decreases to 1
        for (int i = n; i >= 1; i--) {
            // Inner loop: prints i stars
            for (int j = 1; j <= i; j++) {
                System.out.print("*");
            }
            System.out.println();
        }
    }
}`,

  s3: (n) => `// Pattern: Pyramid Stars
public class Pyramid {
    public static void main(String[] args) {
        int n = ${n};
        for (int i = 1; i <= n; i++) {
            // Loop 1: print (n-i) spaces before stars
            for (int j = 1; j <= n - i; j++) {
                System.out.print(" ");
            }
            // Loop 2: print (2i-1) stars — odd count per row
            for (int j = 1; j <= 2 * i - 1; j++) {
                System.out.print("*");
            }
            System.out.println();
        }
    }
}`,

  s4: (n) => `// Pattern: Inverted Pyramid Stars
public class InvertedPyramid {
    public static void main(String[] args) {
        int n = ${n};
        for (int i = n; i >= 1; i--) {
            for (int j = 1; j <= n - i; j++)
                System.out.print(" ");
            for (int j = 1; j <= 2 * i - 1; j++)
                System.out.print("*");
            System.out.println();
        }
    }
}`,

  s5: (n) => `// Pattern: Diamond Stars
public class Diamond {
    public static void main(String[] args) {
        int n = ${n};
        // Upper half: pyramid
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= n - i; j++) System.out.print(" ");
            for (int j = 1; j <= 2*i-1; j++) System.out.print("*");
            System.out.println();
        }
        // Lower half: inverted pyramid (skip last row of upper)
        for (int i = n - 1; i >= 1; i--) {
            for (int j = 1; j <= n - i; j++) System.out.print(" ");
            for (int j = 1; j <= 2*i-1; j++) System.out.print("*");
            System.out.println();
        }
    }
}`,

  s6: (n) => `// Pattern: Hollow Rectangle Stars
public class HollowRectangle {
    public static void main(String[] args) {
        int n = ${n};
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= n; j++) {
                // Star only on 4 borders
                if (i == 1 || i == n || j == 1 || j == n)
                    System.out.print("*");
                else
                    System.out.print(" ");
            }
            System.out.println();
        }
    }
}`,

  s7: (n) => `// Pattern: Hollow Pyramid Stars
public class HollowPyramid {
    public static void main(String[] args) {
        int n = ${n};
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= n - i; j++) System.out.print(" ");
            for (int j = 1; j <= 2*i-1; j++) {
                // Star only at edges of each row or last row
                if (j == 1 || j == 2*i-1 || i == n)
                    System.out.print("*");
                else
                    System.out.print(" ");
            }
            System.out.println();
        }
    }
}`,

  s8: (n) => `// Pattern: Hollow Diamond Stars
public class HollowDiamond {
    public static void main(String[] args) {
        int n = ${n};
        // Upper half
        for (int i = 1; i <= n; i++) {
            for (int j = n; j > i; j--) System.out.print(" ");
            System.out.print("*");
            if (i > 1) {
                for (int j = 1; j < 2*(i-1); j++) System.out.print(" ");
                System.out.print("*");
            }
            System.out.println();
        }
        // Lower half
        for (int i = n-1; i >= 1; i--) {
            for (int j = n; j > i; j--) System.out.print(" ");
            System.out.print("*");
            if (i > 1) {
                for (int j = 1; j < 2*(i-1); j++) System.out.print(" ");
                System.out.print("*");
            }
            System.out.println();
        }
    }
}`,

  s9: (n) => `// Pattern: Mirrored Right Triangle Stars
public class MirroredTriangle {
    public static void main(String[] args) {
        int n = ${n};
        for (int i = 1; i <= n; i++) {
            // Print leading spaces
            for (int j = 1; j <= n - i; j++) System.out.print(" ");
            // Print stars
            for (int j = 1; j <= i; j++) System.out.print("*");
            System.out.println();
        }
    }
}`,

  s10: (n) => `// Pattern: Hourglass Stars
public class Hourglass {
    public static void main(String[] args) {
        int n = ${n};
        // Upper inverted pyramid
        for (int i = n; i >= 1; i--) {
            for (int j = 1; j <= n-i; j++) System.out.print(" ");
            for (int j = 1; j <= 2*i-1; j++) System.out.print("*");
            System.out.println();
        }
        // Lower pyramid (start from 2 to avoid duplicate middle)
        for (int i = 2; i <= n; i++) {
            for (int j = 1; j <= n-i; j++) System.out.print(" ");
            for (int j = 1; j <= 2*i-1; j++) System.out.print("*");
            System.out.println();
        }
    }
}`,

  s11: (n) => `// Pattern: X (Cross) Stars
public class XPattern {
    public static void main(String[] args) {
        int n = ${n};
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= n; j++) {
                // Main diagonal OR anti-diagonal
                if (i == j || i + j == n + 1)
                    System.out.print("* ");
                else
                    System.out.print("  ");
            }
            System.out.println();
        }
    }
}`,

  s12: (n) => `// Pattern: Plus (+) Stars
public class PlusPattern {
    public static void main(String[] args) {
        int n = ${n};
        int mid = n / 2; // middle row and column index
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                if (i == mid || j == mid)
                    System.out.print("* ");
                else
                    System.out.print("  ");
            }
            System.out.println();
        }
    }
}`,

  s13: (n) => `// Pattern: Checkerboard Stars
public class Checkerboard {
    public static void main(String[] args) {
        int n = ${n};
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= n; j++) {
                // Star if sum of row+col is even
                if ((i + j) % 2 == 0)
                    System.out.print("* ");
                else
                    System.out.print("  ");
            }
            System.out.println();
        }
    }
}`,

  s14: (n) => `// Pattern: Zigzag Stars
public class ZigZagStars {
    public static void main(String[] args) {
        int n = ${n};
        for (int i = 1; i <= 2*n-1; i++) {
            if (i <= n)
                // Going down-right
                System.out.println(" ".repeat(i-1) + "*");
            else
                // Going up-right
                System.out.println(" ".repeat(2*n-i-1) + "*");
        }
    }
}`,

  s15: (n) => `// Pattern: Left Triangle Stars
public class LeftTriangle {
    public static void main(String[] args) {
        int n = ${n};
        for (int i = 1; i <= n; i++) {
            // j goes from n down to 1
            for (int j = n; j >= 1; j--) {
                if (j <= i) System.out.print("* ");
                else        System.out.print("  ");
            }
            System.out.println();
        }
    }
}`,

  a1: (n) => `// Pattern: ABC Alphabet Triangle
public class AlphaTriangle {
    public static void main(String[] args) {
        int n = ${n};
        for (int i = 0; i < n; i++) {
            // Print alphabets A to (A+i)
            for (int j = 0; j <= i; j++) {
                System.out.print((char)('A' + j));
            }
            System.out.println();
        }
    }
}
// Output: A  AB  ABC  ABCD  ...`,

  a2: (n) => `// Pattern: Inverted Alphabet Triangle
public class InvAlphaTriangle {
    public static void main(String[] args) {
        int n = ${n};
        for (int i = n-1; i >= 0; i--) {
            for (int j = 0; j <= i; j++) {
                System.out.print((char)('A' + j));
            }
            System.out.println();
        }
    }
}`,

  a3: (n) => `// Pattern: ABCBA Alphabet Pyramid
public class AlphaPyramid {
    public static void main(String[] args) {
        int n = ${n};
        for (int i = 0; i < n; i++) {
            // Leading spaces
            for (int j = 0; j < n-i-1; j++) System.out.print(" ");
            // Ascending: A B C ...
            for (int j = 0; j <= i; j++)
                System.out.print((char)('A' + j));
            // Descending: ... B A
            for (int j = i-1; j >= 0; j--)
                System.out.print((char)('A' + j));
            System.out.println();
        }
    }
}`,

  a4: (n) => `// Pattern: Mirrored Alphabet Triangle
public class MirroredAlpha {
    public static void main(String[] args) {
        int n = ${n};
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n-i-1; j++) System.out.print(" ");
            for (int j = 0; j <= i; j++)
                System.out.print((char)('A' + j));
            System.out.println();
        }
    }
}`,

  a5: (n) => `// Pattern: Same Letter Rows  A BB CCC
public class SameLetterRows {
    public static void main(String[] args) {
        int n = ${n};
        for (int i = 0; i < n; i++) {
            char ch = (char)('A' + i); // row i uses letter (A+i)
            for (int j = 0; j <= i; j++) {
                System.out.print(ch); // repeat it (i+1) times
            }
            System.out.println();
        }
    }
}
// A  BB  CCC  DDDD  EEEEE`,

  a6: (n) => `// Pattern: K-Pattern Alphabets (Decreasing Count)
public class KPatternAlpha {
    public static void main(String[] args) {
        int n = ${n};
        for (int i = 0; i < n; i++) {
            char ch = (char)('A' + i);
            // Row i: print ch exactly (n-i) times
            for (int j = 0; j < n-i; j++) {
                System.out.print(ch);
            }
            System.out.println();
        }
    }
}`,

  a7: (n) => `// Pattern: Zigzag Continuous Alphabets
public class AlphaZigzag {
    public static void main(String[] args) {
        int n = ${n};
        char ch = 'A';
        for (int i = 1; i <= n; i++) {
            for (int j = 0; j < i; j++) {
                System.out.print(ch);
                // Wrap around Z -> A
                ch = (ch < 'Z') ? (char)(ch + 1) : 'A';
            }
            System.out.println();
        }
    }
}`,

  a8: (n) => `// Pattern: Alternating Upper/Lowercase
public class AlternateCase {
    public static void main(String[] args) {
        int n = ${n};
        for (int i = 1; i <= n; i++) {
            for (int j = 0; j < i; j++) {
                char c = (char)('A' + j);
                // Even sum -> uppercase, Odd -> lowercase
                if ((i + j) % 2 == 0)
                    System.out.print(c);
                else
                    System.out.print((char)(c + 32));
            }
            System.out.println();
        }
    }
}`,

  a9: (n) => `// Pattern: Reverse Row Alphabets
public class ReverseRowAlpha {
    public static void main(String[] args) {
        int n = ${n};
        for (int i = 0; i < n; i++) {
            // Start from index i, go down to 0
            for (int j = i; j >= 0; j--) {
                System.out.print((char)('A' + j));
            }
            System.out.println();
        }
    }
}
// A  BA  CBA  DCBA  ...`,

  a10: (n) => `// Pattern: Alphabet Square Grid
public class AlphaSquare {
    public static void main(String[] args) {
        int n = ${n};
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                // Sequential alphabets wrapping A-Z
                System.out.print((char)('A' + (i*n + j) % 26) + " ");
            }
            System.out.println();
        }
    }
}`,

  a11: (n) => `// Pattern: Alphabet Diamond
public class AlphaDiamond {
    public static void main(String[] args) {
        int n = ${n};
        // Upper half
        for (int i = 1; i <= n; i++) {
            for (int j = n; j > i; j--) System.out.print(" ");
            for (int j = 1; j <= i; j++)
                System.out.print((char)('A' + j - 1) + " ");
            System.out.println();
        }
        // Lower half
        for (int i = n-1; i >= 1; i--) {
            for (int j = n; j > i; j--) System.out.print(" ");
            for (int j = 1; j <= i; j++)
                System.out.print((char)('A' + j - 1) + " ");
            System.out.println();
        }
    }
}`,

  a12: (n) => `// Pattern: Border Alphabets (A-Z on hollow rectangle)
public class BorderAlpha {
    public static void main(String[] args) {
        int n = ${n};
        char ch = 'A';
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                if (i==0 || i==n-1 || j==0 || j==n-1) {
                    System.out.print(ch + " ");
                    ch = (ch < 'Z') ? (char)(ch+1) : 'A';
                } else {
                    System.out.print("  ");
                }
            }
            System.out.println();
        }
    }
}`,

  a13: (n) => `// Pattern: Diagonal Alphabet Column
public class DiagonalAlpha {
    public static void main(String[] args) {
        int n = ${n};
        for (int i = 0; i < n; i++) {
            // Print 2*i spaces for indentation
            for (int j = 0; j < i; j++) System.out.print("  ");
            System.out.println((char)('A' + i));
        }
    }
}
// A
//   B
//     C  ...`,

  a14: (n) => `// Pattern: Alphabet Spiral (Decreasing Rows)
public class AlphaSpiral {
    public static void main(String[] args) {
        int n = ${n};
        for (int i = 0; i < n; i++) {
            // Row i starts from index i
            for (int j = i; j < n; j++) {
                System.out.print((char)('A' + j));
            }
            System.out.println();
        }
    }
}
// ABCDEF  BCDEF  CDEF  ...`,

  a15: (n) => `// Pattern: Alphabet Right Angle Border
public class AlphaRightAngle {
    public static void main(String[] args) {
        int n = ${n};
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                // Print on top/bottom row or left column
                if (i==0 || i==n-1 || j==0)
                    System.out.print((char)('A'+i) + " ");
                else
                    System.out.print("  ");
            }
            System.out.println();
        }
    }
}`,

  n1: (n) => `// Pattern: Number Triangle  1 12 123
public class NumberTriangle {
    public static void main(String[] args) {
        int n = ${n};
        for (int i = 1; i <= n; i++) {
            // Print numbers 1 to i in each row
            for (int j = 1; j <= i; j++) {
                System.out.print(j);
            }
            System.out.println();
        }
    }
}
// 1  12  123  1234  12345`,

  n2: (n) => `// Pattern: Inverted Number Triangle
public class InvNumberTriangle {
    public static void main(String[] args) {
        int n = ${n};
        for (int i = n; i >= 1; i--) {
            for (int j = 1; j <= i; j++) {
                System.out.print(j);
            }
            System.out.println();
        }
    }
}`,

  n3: (n) => `// Pattern: Number Pyramid  (1 232 34543)
public class NumberPyramid {
    public static void main(String[] args) {
        int n = ${n};
        for (int i = 1; i <= n; i++) {
            for (int j = 0; j < n-i; j++) System.out.print(" ");
            // Ascending half
            for (int j = 1; j <= i; j++) System.out.print(j);
            // Descending half
            for (int j = i-1; j >= 1; j--) System.out.print(j);
            System.out.println();
        }
    }
}`,

  n4: (n) => `// Pattern: Floyd's Triangle
public class FloydsTriangle {
    public static void main(String[] args) {
        int n = ${n};
        int num = 1; // sequential counter
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= i; j++) {
                System.out.print(num++ + " ");
            }
            System.out.println();
        }
    }
}
// 1  2 3  4 5 6  7 8 9 10 ...`,

  n5: (n) => `// Pattern: Pascal's Triangle
public class PascalTriangle {
    public static void main(String[] args) {
        int n = ${n};
        for (int i = 0; i < n; i++) {
            // Print spaces for centering
            for (int j = 0; j < n-i; j++) System.out.print("  ");
            long val = 1;
            System.out.print(val);
            for (int j = 1; j <= i; j++) {
                // C(i,j) = C(i,j-1) * (i-j+1) / j
                val = val * (i - j + 1) / j;
                System.out.printf("  %d", val);
            }
            System.out.println();
        }
    }
}`,

  n6: (n) => `// Pattern: Same Number Rows  1 22 333
public class SameNumberRows {
    public static void main(String[] args) {
        int n = ${n};
        for (int i = 1; i <= n; i++) {
            // Row i: print number i exactly i times
            for (int j = 0; j < i; j++) {
                System.out.print(i);
            }
            System.out.println();
        }
    }
}
// 1  22  333  4444  55555`,

  n7: (n) => `// Pattern: Hollow Rectangle Numbers
public class HollowRectNumbers {
    public static void main(String[] args) {
        int n = ${n};
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= n; j++) {
                if (i == 1 || i == n)
                    System.out.print(j + " ");  // top/bottom: column number
                else if (j == 1 || j == n)
                    System.out.print(i + " ");  // sides: row number
                else
                    System.out.print("  ");     // hollow inside
            }
            System.out.println();
        }
    }
}`,

  n8: (n) => `// Pattern: Number Diamond
public class NumberDiamond {
    public static void main(String[] args) {
        int n = ${n};
        // Upper half
        for (int i = 1; i <= n; i++) {
            for (int j = n; j > i; j--) System.out.print(" ");
            for (int j = 1; j <= 2*i-1; j++) System.out.print(i + " ");
            System.out.println();
        }
        // Lower half
        for (int i = n-1; i >= 1; i--) {
            for (int j = n; j > i; j--) System.out.print(" ");
            for (int j = 1; j <= 2*i-1; j++) System.out.print(i + " ");
            System.out.println();
        }
    }
}`,

  n9: (n) => `// Pattern: Multiplication Table Grid
public class MultiplicationTable {
    public static void main(String[] args) {
        int n = ${n};
        // Header row
        System.out.print("   |");
        for (int j = 1; j <= n; j++)
            System.out.printf("%4d", j);
        System.out.println("\\n   " + "-".repeat(n*4+3));
        // Table body
        for (int i = 1; i <= n; i++) {
            System.out.printf("%3d|", i);
            for (int j = 1; j <= n; j++) {
                System.out.printf("%4d", i * j);
            }
            System.out.println();
        }
    }
}`,

  n10: (n) => `// Pattern: Binary Triangle (0s and 1s)
public class BinaryTriangle {
    public static void main(String[] args) {
        int n = ${n};
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= i; j++) {
                // 1 if (i+j) is even, 0 otherwise
                System.out.print((i + j) % 2 == 0 ? "1 " : "0 ");
            }
            System.out.println();
        }
    }
}`,

  n11: (n) => `// Pattern: Palindrome Number Rows  121  12321
public class PalindromeRows {
    public static void main(String[] args) {
        int n = ${n};
        for (int i = 1; i <= n; i++) {
            for (int j = 0; j < n-i; j++) System.out.print(" ");
            // Ascending: 1 2 3 ... i
            for (int j = 1; j <= i; j++) System.out.print(j);
            // Descending: (i-1) ... 1
            for (int j = i-1; j >= 1; j--) System.out.print(j);
            System.out.println();
        }
    }
}`,

  n12: (n) => `// Pattern: Right-Aligned Number Triangle
public class RightAlignedNumTri {
    public static void main(String[] args) {
        int n = ${n};
        for (int i = 1; i <= n; i++) {
            // Leading spaces for right alignment
            for (int j = 0; j < n-i; j++) System.out.print("  ");
            // Numbers 1 to i
            for (int j = 1; j <= i; j++) System.out.print(j + " ");
            System.out.println();
        }
    }
}`,

  n13: (n) => `// Pattern: Fibonacci Triangle
public class FibonacciTriangle {
    public static void main(String[] args) {
        int n = ${n};
        int a = 0, b = 1; // Fibonacci starting values
        for (int i = 1; i <= n; i++) {
            for (int j = 0; j < i; j++) {
                System.out.print(b + " "); // print current Fibonacci
                int temp = a + b;           // compute next
                a = b;
                b = temp;
            }
            System.out.println();
        }
    }
}
// 1  1 2  3 5 8  13 21 34 55 ...`,

  n14: (n) => `// Pattern: Sequential Number Square
public class NumberSquare {
    public static void main(String[] args) {
        int n = ${n};
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= n; j++) {
                // Formula: (row-1)*n + col
                System.out.printf("%3d ", (i-1)*n + j);
            }
            System.out.println();
        }
    }
}`,

  n15: (n) => `// Pattern: Sandglass (Hourglass) Numbers
public class Sandglass {
    public static void main(String[] args) {
        int n = ${n};
        // Upper: inverted pyramid
        for (int i = n; i >= 1; i--) {
            for (int j = n; j > i; j--) System.out.print(" ");
            for (int j = 1; j <= 2*i-1; j++) System.out.print(i + " ");
            System.out.println();
        }
        // Lower: pyramid (start from 2 to avoid duplicate)
        for (int i = 2; i <= n; i++) {
            for (int j = n; j > i; j--) System.out.print(" ");
            for (int j = 1; j <= 2*i-1; j++) System.out.print(i + " ");
            System.out.println();
        }
    }
}`,
};

export default function JavaPatterns() {
  const [cat, setCat]       = useState("stars");
  const [sel, setSel]       = useState("s1");
  const [n, setN]           = useState(6);
  const [tab, setTab]       = useState("output");
  const [copied, setCopied] = useState(false);
  const [key, setKey]       = useState(0);

  const catObj  = CATEGORIES.find(c => c.id === cat);
  const pats    = PATTERNS[cat];
  const pat     = pats.find(p => p.id === sel) || pats[0];
  const lines   = generate(pat.id, n);
  const code    = (JAVA_CODES[pat.id] || (() => "// Code coming soon"))(n);

  const changeCat = (id) => { setCat(id); setSel(PATTERNS[id][0].id); setTab("output"); setKey(k=>k+1); };
  const changePat = (id) => { setSel(id); setKey(k=>k+1); setTab("output"); };

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const COL = catObj.color;

  return (
    <div style={{ minHeight:"100vh", background:"#090c12", fontFamily:"'Fira Code','JetBrains Mono',monospace", color:"#cdd9e5", display:"flex", flexDirection:"column" }}>

      {/* ── HEADER ── */}
      <div style={{ background:"linear-gradient(90deg,#0d1117,#161b22)", borderBottom:"1px solid #21262d", padding:"14px 20px", display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
        <div>
          <div style={{ fontSize:18, fontWeight:700, color:"#f0f6fc", letterSpacing:0.5 }}>
            <span style={{ color:"#fbbf24" }}>★</span>{" "}
            Java Patterns{" "}
            <span style={{ color:"#34d399" }}>A-Z</span>{" "}
            <span style={{ color:"#60a5fa" }}>0-9</span>
          </div>
          <div style={{ fontSize:11, color:"#6e7681", marginTop:2 }}>45 patterns — Stars • Alphabets • Numbers — with Java for-loop code</div>
        </div>
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:12, color:"#6e7681" }}>n =</span>
          <input type="range" min={2} max={12} value={n}
            onChange={e => { setN(+e.target.value); setKey(k=>k+1); }}
            style={{ width:90, accentColor:COL }} />
          <span style={{ fontSize:14, fontWeight:700, color:COL, background:catObj.bg, padding:"2px 10px", borderRadius:6, border:`1px solid ${COL}50`, minWidth:28, textAlign:"center" }}>{n}</span>
        </div>
      </div>

      {/* ── CATEGORY TABS ── */}
      <div style={{ display:"flex", background:"#0d1117", borderBottom:"1px solid #21262d", paddingLeft:16 }}>
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => changeCat(c.id)} style={{
            padding:"11px 18px", background:"none", border:"none", cursor:"pointer",
            fontSize:13, fontWeight:600, letterSpacing:0.4,
            color: cat===c.id ? c.color : "#6e7681",
            borderBottom: cat===c.id ? `2px solid ${c.color}` : "2px solid transparent",
            transition:"all .15s",
          }}>{c.label}</button>
        ))}
      </div>

      {/* ── BODY ── */}
      <div style={{ display:"flex", flex:1, overflow:"hidden", minHeight:0 }}>

        {/* ── SIDEBAR ── */}
        <div style={{ width:210, flexShrink:0, background:"#0d1117", borderRight:"1px solid #21262d", overflowY:"auto", padding:"6px 5px" }}>
          {pats.map((p, idx) => {
            const active = sel===p.id;
            return (
              <button key={p.id} onClick={() => changePat(p.id)} style={{
                display:"block", width:"100%", textAlign:"left", padding:"7px 8px",
                borderRadius:6, border:"none", cursor:"pointer", marginBottom:2,
                background: active ? `${COL}15` : "transparent",
                borderLeft: active ? `3px solid ${COL}` : "3px solid transparent",
                transition:"all .12s",
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                  <span style={{ fontSize:10, fontWeight:700, minWidth:22, textAlign:"center", color: active?COL:"#484f58", background: active?`${COL}20`:"#161b22", padding:"1px 4px", borderRadius:4 }}>
                    {String(idx+1).padStart(2,"0")}
                  </span>
                  <div>
                    <div style={{ fontSize:12, color: active?"#f0f6fc":"#8b949e", fontWeight: active?600:400 }}>{p.title}</div>
                    <div style={{ fontSize:10, color:"#484f58", marginTop:1 }}>{p.desc}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── MAIN PANEL ── */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minHeight:0 }}>

          {/* tabs bar */}
          <div style={{ padding:"10px 18px", background:"#0d1117", borderBottom:"1px solid #21262d", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
            <div>
              <span style={{ fontSize:14, fontWeight:700, color:COL }}>{pat.title}</span>
              <span style={{ fontSize:11, color:"#6e7681", marginLeft:10 }}>{pat.desc}</span>
            </div>
            <div style={{ display:"flex", gap:4 }}>
              {["output","code"].map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  padding:"5px 14px", borderRadius:6, border:"none", cursor:"pointer",
                  fontSize:12, fontWeight:600, transition:"all .12s",
                  background: tab===t ? COL : "#161b22",
                  color: tab===t ? "#0d1117" : "#6e7681",
                }}>
                  {t==="output" ? "▦ Output" : "{ } Java Code"}
                </button>
              ))}
            </div>
          </div>

          {/* content area */}
          <div style={{ flex:1, overflowY:"auto", padding:20 }}>
            {tab==="output" ? (
              <div style={{ display:"flex", gap:20, alignItems:"flex-start", flexWrap:"wrap" }}>

                {/* Pattern display */}
                <div style={{ background:"#010409", border:`1px solid ${COL}35`, borderRadius:10, padding:"18px 24px", flexShrink:0 }}>
                  <div style={{ fontSize:11, color:COL, marginBottom:12, letterSpacing:1 }}>● PATTERN  (n={n})</div>
                  <pre key={key} style={{ margin:0, lineHeight:1.7, fontSize:16, color:COL, letterSpacing:3, animation:"fadeIn .25s ease" }}>
                    {lines.join("\n")}
                  </pre>
                </div>

                {/* Loop logic explanation */}
                <div style={{ flex:1, minWidth:260, display:"flex", flexDirection:"column", gap:12 }}>
                  <div style={{ background:"#010409", border:"1px solid #21262d", borderRadius:10, padding:"14px 18px" }}>
                    <div style={{ fontSize:11, color:"#6e7681", marginBottom:8, letterSpacing:1 }}>● HOW IT WORKS</div>
                    <div style={{ fontSize:12, color:"#adbac7", lineHeight:1.8 }}>
                      {getExplanation(pat.id)}
                    </div>
                  </div>
                  <div style={{ background:"#010409", border:`1px solid ${COL}30`, borderRadius:10, padding:"14px 18px" }}>
                    <div style={{ fontSize:11, color:COL, marginBottom:8, letterSpacing:1 }}>● QUICK JAVA SNIPPET</div>
                    <pre style={{ margin:0, fontSize:12, color:"#adbac7", lineHeight:1.7, overflowX:"auto", maxHeight:280, overflowY:"auto" }}>
                      {code.split("\n").slice(0,20).join("\n")}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ background:"#010409", border:`1px solid ${COL}40`, borderRadius:10, overflow:"hidden" }}>
                <div style={{ padding:"10px 16px", background:"#161b22", borderBottom:`1px solid ${COL}30`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <span style={{ fontSize:12, color:COL, fontWeight:600 }}>{pat.title}.java</span>
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <span style={{ fontSize:10, color:"#6e7681" }}>{code.split("\n").length} lines</span>
                    <button onClick={copy} style={{
                      padding:"4px 14px", borderRadius:6, border:"none", cursor:"pointer",
                      fontSize:11, fontWeight:700, transition:"all .15s",
                      background: copied?"#2ea043":"#21262d",
                      color: copied?"#fff":"#8b949e",
                    }}>{copied?"✓ Copied!":"Copy"}</button>
                  </div>
                </div>
                <pre style={{ margin:0, padding:"18px 22px", fontSize:13, lineHeight:1.85, color:"#adbac7", whiteSpace:"pre-wrap", overflowX:"auto" }}>
                  {code.split("\n").map((line, i) => {
                    const isComment = line.trim().startsWith("//") || line.trim().startsWith("/*") || line.trim().startsWith("*");
                    const kwRx = /\b(public|private|static|void|int|long|char|String|for|if|else|class|new|return|boolean|byte|double|float|while|do|switch|case|break|continue)\b/g;
                    const strRx = /"([^"]*)"/g;
                    const numRx = /\b(\d+)\b/g;
                    return (
                      <span key={i} style={{ display:"block" }}>
                        <span style={{ color:"#3d444d", userSelect:"none", marginRight:14, fontSize:11 }}>{String(i+1).padStart(3)}</span>
                        {isComment
                          ? <span style={{ color:"#57ab5a" }}>{line}</span>
                          : <span>{
                              line.split(/(\b(?:public|private|static|void|int|long|char|String|for|if|else|class|new|return|boolean|double|float|while|do|switch|case|break|continue)\b|"[^"]*"|\b\d+\b)/g).map((seg,j) => {
                                if (kwRx.test(seg)) return <span key={j} style={{ color:"#6cb6ff" }}>{seg}</span>;
                                if (/^".*"$/.test(seg)) return <span key={j} style={{ color:"#96d0ff" }}>{seg}</span>;
                                if (/^\d+$/.test(seg)) return <span key={j} style={{ color:"#6e96f7" }}>{seg}</span>;
                                return <span key={j}>{seg}</span>;
                              })
                            }</span>
                        }
                      </span>
                    );
                  })}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ background:"#0d1117", borderTop:"1px solid #21262d", padding:"8px 20px", display:"flex", gap:20, fontSize:11, color:"#484f58", flexWrap:"wrap" }}>
        <span style={{ color:"#fbbf24" }}>★ 15 Star Patterns</span>
        <span style={{ color:"#34d399" }}>A 15 Alpha Patterns</span>
        <span style={{ color:"#60a5fa" }}># 15 Number Patterns</span>
        <span style={{ marginLeft:"auto" }}>45 Total • Java for-loop based • Adjust n with slider</span>
      </div>

      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(3px)} to{opacity:1;transform:none} }
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:#0d1117}
        ::-webkit-scrollbar-thumb{background:#21262d;border-radius:3px}
      `}</style>
    </div>
  );
}

function getExplanation(id) {
  const map = {
    s1:"Outer loop i from 1→n (rows). Inner loop j from 1→i prints i stars per row.",
    s2:"Outer loop i from n→1 (decreasing). Inner prints i stars — largest row first.",
    s3:"Outer loop: i rows. Loop 1: n-i spaces for centering. Loop 2: 2i-1 stars (odd count).",
    s4:"Same as pyramid but outer loop runs n→1 (decreasing for inversion).",
    s5:"Upper half is pyramid (i=1→n). Lower half is inverted (i=n-1→1). Two separate loops.",
    s6:"2D loop. Star only when i==1, i==n, j==1, or j==n (border condition).",
    s7:"Star only at j==1 (left edge), j==2i-1 (right edge), or i==n (bottom row).",
    s8:"Upper half: 1 star expanding. Lower half: mirrors upper. Space count = n-i.",
    s9:"Spaces = n-i (indent), then i stars. Creates right-aligned growing triangle.",
    s10:"First loop: n→1 (inverted pyramid). Second loop: 2→n (pyramid, skips middle).",
    s11:"Print star when i==j (main diagonal) OR i+j==n+1 (anti-diagonal). Else space.",
    s12:"Set mid=n/2. Star when i==mid OR j==mid — creates vertical and horizontal lines.",
    s13:"Star when (i+j)%2==0 — alternating cells like a chess board.",
    s14:"i from 1→2n-1. When i≤n: indent=i-1. When i>n: indent=2n-i-1.",
    s15:"j goes from n→1. Print star when j≤i, else space — gives left-aligned look.",
    a1:"char('A'+j) converts int to char. Row i prints A to A+i.",
    a2:"Outer loop i=n-1→0. Same inner logic as a1 but shrinking.",
    a3:"Ascending loop prints A→(A+i), then descending (A+i-1)→A for symmetry.",
    a4:"Same as pyramid but only ascending letters, with leading spaces.",
    a5:"char ch = 'A'+i. Inner loop repeats ch exactly i+1 times.",
    a6:"char ch = 'A'+i. Inner loop prints ch exactly n-i times (decreasing).",
    a7:"Single char variable ch cycles A→Z→A. Each row adds one more character.",
    a8:"If (i+j)%2==0 print uppercase, else add 32 to char code for lowercase.",
    a9:"Inner loop j from i→0 (reverse). Prints descending alphabet per row.",
    a10:"Formula: ('A' + (i*n+j)%26) — wraps A-Z continuously across grid.",
    a11:"Upper half: pyramid printing 'A'+j-1 per column. Lower: mirrors upper.",
    a12:"Counter ch tracks which letter to print next on border cells only.",
    a13:"Row i: print 2i spaces for indent, then char 'A'+i — creates diagonal.",
    a14:"Row i starts inner loop at j=i — each row drops first letter(s).",
    a15:"Print 'A'+i on top/bottom row (i==0 or i==n-1) and left column (j==0).",
    n1:"Inner loop j from 1→i: prints the column index. Creates 1, 12, 123...",
    n2:"Outer loop n→1. Same inner logic — largest row printed first.",
    n3:"Ascending: j from 1→i. Descending: j from i-1→1. Creates palindrome rows.",
    n4:"num variable increments globally across all iterations — Floyd's sequence.",
    n5:"C(i,j) = C(i,j-1)*(i-j+1)/j. Long to avoid overflow. Spaces center the triangle.",
    n6:"Row i: print number i exactly i times. Formula: same digit repeated.",
    n7:"On border: print row/col number. On interior: spaces. 4 border conditions.",
    n8:"Each row prints the row number i repeatedly for 2i-1 positions. Two halves.",
    n9:"printf('%4d', i*j) prints product right-aligned in 4 chars.",
    n10:"(i+j)%2==0 → print 1, else print 0. Creates alternating binary pattern.",
    n11:"Ascending j from 1→i then descending j from i-1→1. Leading spaces center it.",
    n12:"Leading spaces = n-i. Then j from 1→i with space between.",
    n13:"Two variables a,b track Fibonacci state. Inner loop prints b and advances.",
    n14:"Formula: (i-1)*n + j gives sequential numbers row by row.",
    n15:"First loop n→1 (inverted). Second loop 2→n (normal). Row number fills each cell.",
  };
  return map[id] || "Two nested for loops create the pattern row by row.";
}
