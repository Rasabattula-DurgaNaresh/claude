# 100 Sliding Window Problems for Coding Interviews
## Complete Java Solutions with Explanations

> **Pattern Guide** | **100 Problems** | **Easy → Hard → Advanced**
>
> The Sliding Window technique reduces O(n²) brute-force solutions to **O(n)** by maintaining a window of elements and sliding it across the data, updating results incrementally.

---

## Core Patterns at a Glance

| Pattern | When to Use | Key Idea |
|---------|-------------|----------|
| **Fixed Window** | Window size K is constant | Move right, drop left, update aggregate |
| **Variable Expand** | Shrink until valid | Expand right; shrink left when constraint broken |
| **Variable Contract** | Find minimum | Expand right until valid; shrink left to minimize |
| **Two Pointer** | Pair/partition problems | Left and right pointers move toward each other |
| **Deque Window** | Min/Max in window | Maintain monotonic deque, pop stale & dominated |
| **Hash Map Window** | Character/count tracking | Map stores frequency; shrink when over-limit |

---

## Template Cheat Sheet

```java
// ── Fixed Window ─────────────────────────────────────────────
int windowSum = 0;
for (int i = 0; i < k; i++) windowSum += arr[i];    // build first window
for (int i = k; i < n; i++) {
    windowSum += arr[i] - arr[i - k];               // slide: add new, drop old
    result = Math.max(result, windowSum);
}

// ── Variable Window (find longest valid) ─────────────────────
int left = 0;
for (int right = 0; right < n; right++) {
    // expand: add arr[right] to window state
    while (windowIsInvalid()) {
        // shrink: remove arr[left] from window state
        left++;
    }
    result = Math.max(result, right - left + 1);
}

// ── Variable Window (find shortest valid) ─────────────────────
int left = 0;
for (int right = 0; right < n; right++) {
    // expand: add arr[right] to window state
    while (windowIsValid()) {
        result = Math.min(result, right - left + 1);
        // shrink: remove arr[left]
        left++;
    }
}

// ── Monotonic Deque (max in window) ──────────────────────────
Deque<Integer> dq = new ArrayDeque<>();  // stores indices
for (int i = 0; i < n; i++) {
    while (!dq.isEmpty() && dq.peekFirst() < i - k + 1) dq.pollFirst(); // stale
    while (!dq.isEmpty() && arr[dq.peekLast()] <= arr[i]) dq.pollLast();// dominated
    dq.offerLast(i);
    if (i >= k - 1) result[i - k + 1] = arr[dq.peekFirst()];
}
```

---

# PART 1 — EASY PROBLEMS (1–20)

---

## E1. Maximum Sum Subarray of Size K

**Problem:** Given array `arr` and integer `K`, find the maximum sum of any contiguous subarray of size K.

**Pattern:** Fixed Window — build first window, then slide.

**Example:**
```
arr = [2, 1, 5, 1, 3, 2], K = 3
Windows: [2,1,5]=8, [1,5,1]=7, [5,1,3]=9, [1,3,2]=6
Answer: 9
```

**Approach:**
1. Compute sum of first K elements.
2. For each new element, add it and subtract the element leaving the window.
3. Track maximum.

**Time:** O(n) | **Space:** O(1)

```java
public class MaxSumSubarrayK {
    public static int maxSum(int[] arr, int k) {
        int n = arr.length;
        if (n < k) return -1;

        // Build the first window
        int windowSum = 0;
        for (int i = 0; i < k; i++) windowSum += arr[i];

        int maxSum = windowSum;

        // Slide the window: add arr[i], remove arr[i-k]
        for (int i = k; i < n; i++) {
            windowSum += arr[i] - arr[i - k];
            maxSum = Math.max(maxSum, windowSum);
        }
        return maxSum;
    }

    public static void main(String[] args) {
        System.out.println(maxSum(new int[]{2, 1, 5, 1, 3, 2}, 3)); // 9
        System.out.println(maxSum(new int[]{1, 4, 2, 10, 2, 3, 1, 0, 20}, 4)); // 24
    }
}
```

---

## E2. Average of Subarrays of Size K

**Problem:** Return array of averages of every contiguous subarray of size K.

**Pattern:** Fixed Window — same as E1 but store average.

**Example:**
```
arr = [1, 3, 2, 6, -1, 4, 1, 8, 2], K = 5
Output: [2.2, 2.8, 2.4, 3.6, 2.8]
```

**Time:** O(n) | **Space:** O(n-k+1) for output

```java
public class AverageSubarrayK {
    public static double[] findAverages(int[] arr, int k) {
        int n = arr.length;
        double[] result = new double[n - k + 1];

        double windowSum = 0;
        for (int i = 0; i < k; i++) windowSum += arr[i];
        result[0] = windowSum / k;

        for (int i = k; i < n; i++) {
            windowSum += arr[i] - arr[i - k];
            result[i - k + 1] = windowSum / k;
        }
        return result;
    }

    public static void main(String[] args) {
        double[] res = findAverages(new int[]{1, 3, 2, 6, -1, 4, 1, 8, 2}, 5);
        System.out.println(java.util.Arrays.toString(res));
        // [2.2, 2.8, 2.4, 3.6, 2.8]
    }
}
```

---

## E3. First Negative Integer in Every Window

**Problem:** For every window of size K, print the first negative integer. Print 0 if none.

**Pattern:** Fixed Window + Deque to track negative indices.

**Example:**
```
arr = [-8, 2, 3, -6, 10], K = 2
Windows: [-8,2]→-8, [2,3]→0, [3,-6]→-6, [-6,10]→-6
Output: [-8, 0, -6, -6]
```

**Time:** O(n) | **Space:** O(k)

```java
import java.util.*;

public class FirstNegativeInWindow {
    public static long[] firstNegative(long[] arr, int k) {
        int n = arr.length;
        long[] result = new long[n - k + 1];
        Deque<Integer> dq = new ArrayDeque<>(); // stores indices of negatives

        // Process first window
        for (int i = 0; i < k; i++) {
            if (arr[i] < 0) dq.offerLast(i);
        }

        for (int i = k; i <= n; i++) {
            // Record result for previous window
            result[i - k] = dq.isEmpty() ? 0 : arr[dq.peekFirst()];

            // Remove indices outside the new window
            if (!dq.isEmpty() && dq.peekFirst() <= i - k) dq.pollFirst();

            // Add new element if negative
            if (i < n && arr[i] < 0) dq.offerLast(i);
        }
        return result;
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(
            firstNegative(new long[]{-8, 2, 3, -6, 10}, 2)));
        // [-8, 0, -6, -6]
    }
}
```

---

## E4. Count Distinct Elements in Every Window

**Problem:** For each window of size K, count the number of distinct elements.

**Pattern:** Fixed Window + HashMap for frequency tracking.

**Example:**
```
arr = [1, 2, 1, 3, 4, 2, 3], K = 4
Windows: {1,2,3}→3, {2,1,3,4}→4, {1,3,4,2}→4, {3,4,2,3}→3
Output: [3, 4, 4, 3]
```

**Time:** O(n) | **Space:** O(k)

```java
import java.util.*;

public class CountDistinctInWindow {
    public static int[] countDistinct(int[] arr, int k) {
        int n = arr.length;
        int[] result = new int[n - k + 1];
        Map<Integer, Integer> freq = new HashMap<>();

        // Build first window
        for (int i = 0; i < k; i++)
            freq.merge(arr[i], 1, Integer::sum);
        result[0] = freq.size();

        // Slide the window
        for (int i = k; i < n; i++) {
            // Add new element
            freq.merge(arr[i], 1, Integer::sum);

            // Remove outgoing element
            int out = arr[i - k];
            freq.put(out, freq.get(out) - 1);
            if (freq.get(out) == 0) freq.remove(out);

            result[i - k + 1] = freq.size();
        }
        return result;
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(
            countDistinct(new int[]{1, 2, 1, 3, 4, 2, 3}, 4)));
        // [3, 4, 4, 3]
    }
}
```

---

## E5. Maximum of All Subarrays of Size K

**Problem:** Find the maximum element in every subarray of size K.

**Pattern:** Monotonic Deque — maintain decreasing order of values (indices stored).

**Example:**
```
arr = [1, 3, -1, -3, 5, 3, 6, 7], K = 3
Output: [3, 3, 5, 5, 6, 7]
```

**Key Insight:** Keep a deque of indices. Front = max of current window.
- Pop front if it's outside window.
- Pop back while back element ≤ current (they'll never be the max while current exists).

**Time:** O(n) each element pushed/popped once | **Space:** O(k)

```java
import java.util.*;

public class SlidingWindowMaximum {
    public static int[] maxSlidingWindow(int[] arr, int k) {
        int n = arr.length;
        int[] result = new int[n - k + 1];
        Deque<Integer> dq = new ArrayDeque<>(); // stores indices

        for (int i = 0; i < n; i++) {
            // Remove indices outside current window
            while (!dq.isEmpty() && dq.peekFirst() < i - k + 1)
                dq.pollFirst();

            // Remove indices whose values are less than arr[i]
            // (they can never be the max while arr[i] is in window)
            while (!dq.isEmpty() && arr[dq.peekLast()] <= arr[i])
                dq.pollLast();

            dq.offerLast(i);

            // Window is fully formed
            if (i >= k - 1)
                result[i - k + 1] = arr[dq.peekFirst()];
        }
        return result;
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(
            maxSlidingWindow(new int[]{1, 3, -1, -3, 5, 3, 6, 7}, 3)));
        // [3, 3, 5, 5, 6, 7]
    }
}
```

---

## E6. Minimum Sum Subarray of Size K

**Problem:** Find the minimum sum of any contiguous subarray of size K.

**Pattern:** Fixed Window — same as E1 but track minimum.

```java
public class MinSumSubarrayK {
    public static int minSum(int[] arr, int k) {
        int n = arr.length;
        int windowSum = 0;
        for (int i = 0; i < k; i++) windowSum += arr[i];
        int minSum = windowSum;

        for (int i = k; i < n; i++) {
            windowSum += arr[i] - arr[i - k];
            minSum = Math.min(minSum, windowSum);
        }
        return minSum;
    }

    public static void main(String[] args) {
        System.out.println(minSum(new int[]{10, 20, 30, 5, 1}, 3)); // 36
        System.out.println(minSum(new int[]{2, 3, 4, 1, 5}, 2));    // 3
    }
}
```

---

## E7. Find All Anagrams in a String

**LeetCode #438** | **Pattern:** Fixed Window + Frequency Array

**Problem:** Given strings `s` and `p`, return all start indices in `s` where a substring is an anagram of `p`.

**Example:**
```
s = "cbaebabacd", p = "abc"
Output: [0, 6]
Explanation: s[0..2]="cba" and s[6..8]="bac" are anagrams of "abc"
```

**Approach:** Maintain character frequency array. When window frequency matches pattern frequency, record start index.

**Time:** O(n) | **Space:** O(26) = O(1)

```java
import java.util.*;

public class FindAllAnagrams {
    public static List<Integer> findAnagrams(String s, String p) {
        List<Integer> result = new ArrayList<>();
        if (s.length() < p.length()) return result;

        int[] pCount = new int[26];
        int[] sCount = new int[26];

        // Count pattern characters
        for (char c : p.toCharArray()) pCount[c - 'a']++;

        int k = p.length();

        // Build first window
        for (int i = 0; i < k; i++) sCount[s.charAt(i) - 'a']++;
        if (Arrays.equals(pCount, sCount)) result.add(0);

        // Slide window
        for (int i = k; i < s.length(); i++) {
            sCount[s.charAt(i) - 'a']++;            // add new
            sCount[s.charAt(i - k) - 'a']--;        // remove old
            if (Arrays.equals(pCount, sCount))
                result.add(i - k + 1);
        }
        return result;
    }

    public static void main(String[] args) {
        System.out.println(findAnagrams("cbaebabacd", "abc")); // [0, 6]
        System.out.println(findAnagrams("abab", "ab"));        // [0, 1, 2]
    }
}
```

---

## E8. Sliding Window Maximum (Revisited with Stream Output)

**LeetCode #239** — See E5 for the classic solution. Here's a variant showing the result building pattern clearly:

```java
import java.util.*;

public class SlidingWindowMaxV2 {
    // Returns result as List for clarity
    public static List<Integer> maxWindow(int[] nums, int k) {
        List<Integer> result = new ArrayList<>();
        Deque<Integer> dq = new ArrayDeque<>();

        for (int i = 0; i < nums.length; i++) {
            // Evict stale front
            if (!dq.isEmpty() && dq.peek() == i - k) dq.poll();
            // Maintain decreasing order
            while (!dq.isEmpty() && nums[dq.peekLast()] < nums[i])
                dq.pollLast();
            dq.offer(i);
            if (i >= k - 1) result.add(nums[dq.peek()]);
        }
        return result;
    }

    public static void main(String[] args) {
        System.out.println(maxWindow(new int[]{1,3,-1,-3,5,3,6,7}, 3));
        // [3, 3, 5, 5, 6, 7]
    }
}
```

---

## E9. Subarray with Given Sum (Non-negative)

**Problem:** Find a contiguous subarray with sum equal to target S.

**Pattern:** Variable Window — expand right, shrink left.

**Example:**
```
arr = [1, 4, 20, 3, 10, 5], S = 33
Output: subarray [20, 3, 10] at indices [2, 4]
```

**Time:** O(n) | **Space:** O(1)

```java
public class SubarrayWithGivenSum {
    public static int[] findSubarray(int[] arr, int target) {
        int left = 0, sum = 0;

        for (int right = 0; right < arr.length; right++) {
            sum += arr[right];

            // Shrink from left while sum exceeds target
            while (sum > target && left < right) {
                sum -= arr[left++];
            }

            if (sum == target)
                return new int[]{left, right}; // 0-indexed inclusive
        }
        return new int[]{-1, -1}; // not found
    }

    public static void main(String[] args) {
        int[] r1 = findSubarray(new int[]{1, 4, 20, 3, 10, 5}, 33);
        System.out.println(java.util.Arrays.toString(r1)); // [2, 4]

        int[] r2 = findSubarray(new int[]{1, 4, 0, 0, 3, 10, 5}, 7);
        System.out.println(java.util.Arrays.toString(r2)); // [1, 4]
    }
}
```

---

## E10. Number of Subarrays of Size K with Average ≥ Threshold

**LeetCode #1343** | **Pattern:** Fixed Window

**Problem:** Return count of subarrays of size K where average ≥ threshold.

**Time:** O(n) | **Space:** O(1)

```java
public class SubarraysAvgThreshold {
    public static int numOfSubarrays(int[] arr, int k, int threshold) {
        int count = 0;
        int windowSum = 0;

        for (int i = 0; i < k; i++) windowSum += arr[i];
        if (windowSum >= (long) threshold * k) count++;

        for (int i = k; i < arr.length; i++) {
            windowSum += arr[i] - arr[i - k];
            if (windowSum >= (long) threshold * k) count++;
        }
        return count;
    }

    public static void main(String[] args) {
        System.out.println(numOfSubarrays(new int[]{2,2,2,2,5,5,5,8}, 3, 4)); // 3
        System.out.println(numOfSubarrays(new int[]{11,13,17,23,29,31,7,5,2,3}, 3, 5)); // 6
    }
}
```

---

## E11. Maximum Average Subarray I

**LeetCode #643** | **Pattern:** Fixed Window — return max average.

```java
public class MaxAverageSubarray {
    public static double findMaxAverage(int[] nums, int k) {
        double sum = 0;
        for (int i = 0; i < k; i++) sum += nums[i];
        double maxSum = sum;

        for (int i = k; i < nums.length; i++) {
            sum += nums[i] - nums[i - k];
            maxSum = Math.max(maxSum, sum);
        }
        return maxSum / k;
    }

    public static void main(String[] args) {
        System.out.println(findMaxAverage(new int[]{1,12,-5,-6,50,3}, 4)); // 12.75
        System.out.println(findMaxAverage(new int[]{5}, 1));               // 5.0
    }
}
```

---

## E12. Diet Plan Performance

**LeetCode #1176** | **Pattern:** Fixed Window — count windows below/above thresholds.

**Problem:** Given calories[], k, lower, upper. For each window:
- +1 if sum < lower (underperfom)
- -1 if sum > upper (overperfom)
- 0 otherwise. Return total points.

```java
public class DietPlanPerformance {
    public static int dietPlanPerformance(int[] calories, int k, int lower, int upper) {
        int points = 0, sum = 0;

        for (int i = 0; i < k; i++) sum += calories[i];

        if      (sum < lower) points--;
        else if (sum > upper) points++;

        for (int i = k; i < calories.length; i++) {
            sum += calories[i] - calories[i - k];
            if      (sum < lower) points--;
            else if (sum > upper) points++;
        }
        return points;
    }

    public static void main(String[] args) {
        System.out.println(dietPlanPerformance(new int[]{1,2,3,4,5}, 1, 3, 3)); // 0
        System.out.println(dietPlanPerformance(new int[]{3,2}, 2, 0, 1));       // 1
        System.out.println(dietPlanPerformance(new int[]{6,5,0,4,2,4,1,0,0}, 2, 1, 5)); // 0
    }
}
```

---

## E13. Defuse the Bomb

**LeetCode #1652** | **Pattern:** Fixed Circular Window

**Problem:** Circular array `code`. For each index i:
- If k > 0: replace with sum of next k elements
- If k < 0: replace with sum of previous |k| elements
- If k = 0: replace with 0

```java
public class DefuseBomb {
    public static int[] decrypt(int[] code, int k) {
        int n = code.length;
        int[] result = new int[n];
        if (k == 0) return result; // all zeros

        for (int i = 0; i < n; i++) {
            int sum = 0;
            if (k > 0) {
                for (int j = i + 1; j <= i + k; j++)
                    sum += code[j % n];
            } else {
                for (int j = i + k; j < i; j++)
                    sum += code[((j % n) + n) % n];
            }
            result[i] = sum;
        }
        return result;
        // Note: O(n*k) — sliding window optimization shown below
    }

    // Optimised O(n) sliding window version
    public static int[] decryptOptimal(int[] code, int k) {
        int n = code.length;
        int[] result = new int[n];
        if (k == 0) return result;

        // Double the array conceptually for circular access
        int[] ext = new int[2 * n];
        for (int i = 0; i < 2 * n; i++) ext[i] = code[i % n];

        int start = k > 0 ? 1 : n + k;
        int end   = k > 0 ? k : n - 1;
        int sum   = 0;
        for (int i = start; i <= end; i++) sum += ext[i];
        result[0] = sum;

        for (int i = 1; i < n; i++) {
            sum += ext[i + end] - ext[i + start - 1];
            result[i] = sum;
        }
        return result;
    }

    public static void main(String[] args) {
        System.out.println(java.util.Arrays.toString(decrypt(new int[]{5,7,1,4}, 3))); // [12,10,16,13]
        System.out.println(java.util.Arrays.toString(decrypt(new int[]{2,4,9,3}, -2)));// [12,5,6,13]
    }
}
```

---

## E14. K Radius Subarray Averages

**LeetCode #2090** | **Pattern:** Fixed Window of size 2k+1

**Problem:** For each index i, average of elements within radius k. Return -1 if not enough elements.

```java
public class KRadiusSubarrayAverages {
    public static int[] getAverages(int[] nums, int k) {
        int n = nums.length;
        int[] result = new int[n];
        java.util.Arrays.fill(result, -1);

        int windowSize = 2 * k + 1;
        if (windowSize > n) return result;

        long sum = 0;
        for (int i = 0; i < windowSize; i++) sum += nums[i];
        result[k] = (int)(sum / windowSize);

        for (int i = windowSize; i < n; i++) {
            sum += nums[i] - nums[i - windowSize];
            result[i - k] = (int)(sum / windowSize);
        }
        return result;
    }

    public static void main(String[] args) {
        System.out.println(java.util.Arrays.toString(
            getAverages(new int[]{7,4,3,9,1,8,5,2,6}, 3)));
        // [-1,-1,-1,5,4,4,-1,-1,-1]
    }
}
```

---

## E15. Count Vowel Substrings

**LeetCode #2062** | **Pattern:** Fixed/Variable Window — count substrings with all 5 vowels.

**Note:** This is a brute-force acceptable here; O(n²). Sliding window version uses "at least" trick.

```java
import java.util.*;

public class CountVowelSubstrings {
    // O(n^2) direct approach
    public static int countVowelSubstrings(String word) {
        int count = 0;
        Set<Character> vowels = Set.of('a','e','i','o','u');
        int n = word.length();

        for (int i = 0; i < n; i++) {
            if (!vowels.contains(word.charAt(i))) continue;
            Set<Character> seen = new HashSet<>();
            for (int j = i; j < n; j++) {
                char c = word.charAt(j);
                if (!vowels.contains(c)) break;
                seen.add(c);
                if (seen.size() == 5) count++;
            }
        }
        return count;
    }

    // O(n) sliding window using "atLeastK distinct" trick
    // count(exactly 5 distinct vowels) = atLeast(5) - atLeast(6)
    public static int countVowelSubstringsOptimal(String word) {
        return atLeast(word, 5) - atLeast(word, 6);
    }

    private static int atLeast(String word, int k) {
        Set<Character> vowels = Set.of('a','e','i','o','u');
        Map<Character, Integer> freq = new HashMap<>();
        int left = 0, count = 0;

        for (int right = 0; right < word.length(); right++) {
            char c = word.charAt(right);
            if (!vowels.contains(c)) {
                freq.clear(); left = right + 1; continue;
            }
            freq.merge(c, 1, Integer::sum);
            while (freq.size() >= k) {
                count += word.length() - right;
                char lc = word.charAt(left++);
                freq.put(lc, freq.get(lc) - 1);
                if (freq.get(lc) == 0) freq.remove(lc);
            }
        }
        return count;
    }

    public static void main(String[] args) {
        System.out.println(countVowelSubstrings("aeiouu")); // 2
        System.out.println(countVowelSubstrings("unicornareoioiou")); // 0
        System.out.println(countVowelSubstringsOptimal("aeiouu")); // 2
    }
}
```

---

## E16. Longest Continuous Increasing Subarray

**LeetCode #674** | **Pattern:** Variable Window — reset when not increasing.

```java
public class LongestContinuousIncreasing {
    public static int findLengthOfLCIS(int[] nums) {
        if (nums.length == 0) return 0;
        int maxLen = 1, curLen = 1;

        for (int i = 1; i < nums.length; i++) {
            if (nums[i] > nums[i - 1]) {
                curLen++;
                maxLen = Math.max(maxLen, curLen);
            } else {
                curLen = 1; // reset window
            }
        }
        return maxLen;
    }

    public static void main(String[] args) {
        System.out.println(findLengthOfLCIS(new int[]{1,3,5,4,7})); // 3
        System.out.println(findLengthOfLCIS(new int[]{2,2,2,2,2})); // 1
    }
}
```

---

## E17. Maximum Consecutive Ones

**LeetCode #485** | **Pattern:** Single Pass — count run, reset at 0.

```java
public class MaxConsecutiveOnes {
    public static int findMaxConsecutiveOnes(int[] nums) {
        int maxOnes = 0, curOnes = 0;
        for (int num : nums) {
            if (num == 1) maxOnes = Math.max(maxOnes, ++curOnes);
            else          curOnes = 0;
        }
        return maxOnes;
    }

    public static void main(String[] args) {
        System.out.println(findMaxConsecutiveOnes(new int[]{1,1,0,1,1,1})); // 3
        System.out.println(findMaxConsecutiveOnes(new int[]{1,0,1,1,0,1})); // 2
    }
}
```

---

## E18. Maximum Consecutive Ones II

**LeetCode #487** | **Pattern:** Variable Window — allow at most one 0 flip.

```java
public class MaxConsecutiveOnesII {
    public static int findMaxConsecutiveOnes(int[] nums) {
        int left = 0, zerosUsed = 0, maxLen = 0;

        for (int right = 0; right < nums.length; right++) {
            if (nums[right] == 0) zerosUsed++;

            // Shrink window until at most one zero
            while (zerosUsed > 1) {
                if (nums[left++] == 0) zerosUsed--;
            }
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }

    public static void main(String[] args) {
        System.out.println(findMaxConsecutiveOnes(new int[]{1,0,1,1,0}));   // 4
        System.out.println(findMaxConsecutiveOnes(new int[]{1,0,1,1,0,1})); // 5 (if you could flip)
    }
}
```

---

## E19. Maximum Consecutive Ones III

**LeetCode #1004** | **Pattern:** Variable Window — allow at most K zero flips.

**Example:**
```
nums = [1,1,1,0,0,0,1,1,1,1,0], K = 2
Output: 6  (flip indices 3,4 → longest run of 1s)
```

```java
public class MaxConsecutiveOnesIII {
    public static int longestOnes(int[] nums, int k) {
        int left = 0, zerosUsed = 0, maxLen = 0;

        for (int right = 0; right < nums.length; right++) {
            if (nums[right] == 0) zerosUsed++;

            while (zerosUsed > k) {
                if (nums[left++] == 0) zerosUsed--;
            }
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }

    public static void main(String[] args) {
        System.out.println(longestOnes(new int[]{1,1,1,0,0,0,1,1,1,1,0}, 2)); // 6
        System.out.println(longestOnes(new int[]{0,0,1,1,0,0,1,1,1,0,1,1,0,0,0,1,1,1,1}, 3)); // 10
    }
}
```

---

## E20. Contains Duplicate II

**LeetCode #219** | **Pattern:** Fixed Window + HashSet.

**Problem:** Return true if any two duplicates are at most K indices apart.

```java
import java.util.*;

public class ContainsDuplicateII {
    public static boolean containsNearbyDuplicate(int[] nums, int k) {
        Set<Integer> window = new HashSet<>();

        for (int i = 0; i < nums.length; i++) {
            if (window.contains(nums[i])) return true;
            window.add(nums[i]);
            if (window.size() > k)
                window.remove(nums[i - k]); // maintain window of size k
        }
        return false;
    }

    public static void main(String[] args) {
        System.out.println(containsNearbyDuplicate(new int[]{1,2,3,1}, 3));   // true
        System.out.println(containsNearbyDuplicate(new int[]{1,0,1,1}, 1));   // true
        System.out.println(containsNearbyDuplicate(new int[]{1,2,3,1,2,3}, 2)); // false
    }
}
```

---
---

# PART 2 — MEDIUM PROBLEMS (1–30)

---

## M1. Longest Substring Without Repeating Characters

**LeetCode #3** | **Pattern:** Variable Window + HashSet

**Problem:** Find the length of the longest substring without repeating characters.

**Example:**
```
s = "abcabcbb" → 3 ("abc")
s = "bbbbb"    → 1 ("b")
s = "pwwkew"   → 3 ("wke")
```

**Approach:** Expand right; when duplicate found, shrink left until duplicate is removed.

**Time:** O(n) | **Space:** O(min(n, alphabet_size))

```java
import java.util.*;

public class LongestSubstringNoRepeat {
    public static int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> lastSeen = new HashMap<>();
        int left = 0, maxLen = 0;

        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            // If character was seen inside current window, jump left past it
            if (lastSeen.containsKey(c) && lastSeen.get(c) >= left) {
                left = lastSeen.get(c) + 1;
            }
            lastSeen.put(c, right);
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }

    public static void main(String[] args) {
        System.out.println(lengthOfLongestSubstring("abcabcbb")); // 3
        System.out.println(lengthOfLongestSubstring("bbbbb"));    // 1
        System.out.println(lengthOfLongestSubstring("pwwkew"));   // 3
        System.out.println(lengthOfLongestSubstring(""));         // 0
    }
}
```

---

## M2. Longest Substring with K Unique Characters

**Pattern:** Variable Window + HashMap

**Problem:** Find length of longest substring with exactly K unique characters.

**Example:**
```
s = "araaci", K = 2 → 4 ("araa")
s = "aaa", K = 1    → 3 ("aaa")
```

```java
import java.util.*;

public class LongestSubstringKUnique {
    public static int longestKUniqueChars(String s, int k) {
        Map<Character, Integer> freq = new HashMap<>();
        int left = 0, maxLen = 0;

        for (int right = 0; right < s.length(); right++) {
            freq.merge(s.charAt(right), 1, Integer::sum);

            // Shrink until at most k distinct chars
            while (freq.size() > k) {
                char lc = s.charAt(left++);
                freq.put(lc, freq.get(lc) - 1);
                if (freq.get(lc) == 0) freq.remove(lc);
            }

            if (freq.size() == k) // exactly k
                maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }

    public static void main(String[] args) {
        System.out.println(longestKUniqueChars("araaci", 2)); // 4
        System.out.println(longestKUniqueChars("aaa", 1));    // 3
        System.out.println(longestKUniqueChars("cbbebi", 3)); // 5
    }
}
```

---

## M3. Longest Substring with At Most Two Distinct Characters

**LeetCode #159** | **Pattern:** Variable Window + HashMap (K=2 special case of M2)

```java
import java.util.*;

public class LongestSubstringTwoDistinct {
    public static int lengthOfLongestSubstringTwoDistinct(String s) {
        Map<Character, Integer> freq = new HashMap<>();
        int left = 0, maxLen = 0;

        for (int right = 0; right < s.length(); right++) {
            freq.merge(s.charAt(right), 1, Integer::sum);

            while (freq.size() > 2) {
                char lc = s.charAt(left++);
                freq.put(lc, freq.get(lc) - 1);
                if (freq.get(lc) == 0) freq.remove(lc);
            }
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }

    public static void main(String[] args) {
        System.out.println(lengthOfLongestSubstringTwoDistinct("eceba")); // 3 ("ece")
        System.out.println(lengthOfLongestSubstringTwoDistinct("ccaabbb")); // 5 ("aabbb")
    }
}
```

---

## M4. Longest Repeating Character Replacement

**LeetCode #424** | **Pattern:** Variable Window + Frequency Array

**Problem:** You can replace at most K characters. Find the longest substring with all same characters after replacements.

**Key Insight:** `window_size - max_frequency <= K` means we can make all chars the same using at most K replacements.

**Example:**
```
s = "AABABBA", K = 1 → 4 ("AABA" → replace B)
```

**Time:** O(n) | **Space:** O(26)

```java
public class CharacterReplacement {
    public static int characterReplacement(String s, int k) {
        int[] freq = new int[26];
        int left = 0, maxFreq = 0, maxLen = 0;

        for (int right = 0; right < s.length(); right++) {
            freq[s.charAt(right) - 'A']++;
            maxFreq = Math.max(maxFreq, freq[s.charAt(right) - 'A']);

            // If replacements needed > k, shrink window
            int windowSize = right - left + 1;
            if (windowSize - maxFreq > k) {
                freq[s.charAt(left++) - 'A']--;
                // Note: maxFreq may be stale but we only care if it grows
            }
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }

    public static void main(String[] args) {
        System.out.println(characterReplacement("ABAB", 2));    // 4
        System.out.println(characterReplacement("AABABBA", 1)); // 4
    }
}
```

---

## M5. Minimum Window Substring

**LeetCode #76** | **Pattern:** Variable Window — Minimum valid

**Problem:** Given strings `s` and `t`, return the minimum window substring of `s` which contains all characters of `t`.

**Example:**
```
s = "ADOBECODEBANC", t = "ABC"
Output: "BANC"
```

**Approach:**
1. Track required character counts from `t`.
2. Expand right until window contains all of `t`.
3. Shrink left while window is still valid, recording minimum.

**Time:** O(|s| + |t|) | **Space:** O(|s| + |t|)

```java
import java.util.*;

public class MinimumWindowSubstring {
    public static String minWindow(String s, String t) {
        if (s.isEmpty() || t.isEmpty()) return "";

        Map<Character, Integer> need = new HashMap<>();
        for (char c : t.toCharArray()) need.merge(c, 1, Integer::sum);

        int left = 0, formed = 0, required = need.size();
        Map<Character, Integer> window = new HashMap<>();
        int[] ans = {-1, 0, 0}; // [length, left, right]

        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            window.merge(c, 1, Integer::sum);

            // Check if this character's frequency meets requirement
            if (need.containsKey(c) && window.get(c).intValue() == need.get(c).intValue())
                formed++;

            // Contract window while valid
            while (left <= right && formed == required) {
                if (ans[0] == -1 || right - left + 1 < ans[0]) {
                    ans[0] = right - left + 1;
                    ans[1] = left;
                    ans[2] = right;
                }
                char lc = s.charAt(left++);
                window.put(lc, window.get(lc) - 1);
                if (need.containsKey(lc) && window.get(lc) < need.get(lc))
                    formed--;
            }
        }
        return ans[0] == -1 ? "" : s.substring(ans[1], ans[2] + 1);
    }

    public static void main(String[] args) {
        System.out.println(minWindow("ADOBECODEBANC", "ABC")); // "BANC"
        System.out.println(minWindow("a", "a"));               // "a"
        System.out.println(minWindow("a", "aa"));              // ""
    }
}
```

---

## M6. Permutation in String

**LeetCode #567** | **Pattern:** Fixed Window + Frequency Array

**Problem:** Return true if s2 contains a permutation of s1.

**Example:**
```
s1 = "ab", s2 = "eidbaooo" → true ("ba" is permutation of "ab")
```

```java
import java.util.*;

public class PermutationInString {
    public static boolean checkInclusion(String s1, String s2) {
        if (s1.length() > s2.length()) return false;
        int[] need = new int[26], window = new int[26];

        for (char c : s1.toCharArray()) need[c - 'a']++;
        int k = s1.length();

        for (int i = 0; i < k; i++) window[s2.charAt(i) - 'a']++;
        if (Arrays.equals(need, window)) return true;

        for (int i = k; i < s2.length(); i++) {
            window[s2.charAt(i) - 'a']++;
            window[s2.charAt(i - k) - 'a']--;
            if (Arrays.equals(need, window)) return true;
        }
        return false;
    }

    public static void main(String[] args) {
        System.out.println(checkInclusion("ab", "eidbaooo")); // true
        System.out.println(checkInclusion("ab", "eidboaoo")); // false
    }
}
```

---

## M7. Fruit Into Baskets

**LeetCode #904** | **Pattern:** Variable Window — at most 2 distinct values

**Problem:** Pick fruits into 2 baskets; each basket holds only one type. Maximize fruits picked in a contiguous section.

```java
import java.util.*;

public class FruitIntoBaskets {
    public static int totalFruit(int[] fruits) {
        Map<Integer, Integer> basket = new HashMap<>();
        int left = 0, maxLen = 0;

        for (int right = 0; right < fruits.length; right++) {
            basket.merge(fruits[right], 1, Integer::sum);

            while (basket.size() > 2) {
                int lf = fruits[left++];
                basket.put(lf, basket.get(lf) - 1);
                if (basket.get(lf) == 0) basket.remove(lf);
            }
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }

    public static void main(String[] args) {
        System.out.println(totalFruit(new int[]{1,2,1}));          // 3
        System.out.println(totalFruit(new int[]{0,1,2,2}));        // 3
        System.out.println(totalFruit(new int[]{1,2,3,2,2}));      // 4
    }
}
```

---

## M8. Minimum Size Subarray Sum

**LeetCode #209** | **Pattern:** Variable Window — minimum length

**Problem:** Find minimum length subarray with sum ≥ target.

**Example:**
```
target = 7, nums = [2,3,1,2,4,3] → 2 (subarray [4,3])
```

**Time:** O(n) | **Space:** O(1)

```java
public class MinSizeSubarraySum {
    public static int minSubArrayLen(int target, int[] nums) {
        int left = 0, sum = 0, minLen = Integer.MAX_VALUE;

        for (int right = 0; right < nums.length; right++) {
            sum += nums[right];

            // Shrink while sum is sufficient
            while (sum >= target) {
                minLen = Math.min(minLen, right - left + 1);
                sum -= nums[left++];
            }
        }
        return minLen == Integer.MAX_VALUE ? 0 : minLen;
    }

    public static void main(String[] args) {
        System.out.println(minSubArrayLen(7, new int[]{2,3,1,2,4,3})); // 2
        System.out.println(minSubArrayLen(4, new int[]{1,4,4}));        // 1
        System.out.println(minSubArrayLen(11, new int[]{1,1,1,1,1,1,1,1})); // 0
    }
}
```

---

## M9. Binary Subarrays With Sum

**LeetCode #930** | **Pattern:** Variable Window — count subarrays with exact sum

**Key Trick:** `count(sum == goal) = count(sum <= goal) - count(sum <= goal-1)`

```java
public class BinarySubarraysWithSum {
    public static int numSubarraysWithSum(int[] nums, int goal) {
        return atMost(nums, goal) - atMost(nums, goal - 1);
    }

    private static int atMost(int[] nums, int goal) {
        if (goal < 0) return 0;
        int left = 0, sum = 0, count = 0;
        for (int right = 0; right < nums.length; right++) {
            sum += nums[right];
            while (sum > goal) sum -= nums[left++];
            count += right - left + 1; // all subarrays ending at right with sum <= goal
        }
        return count;
    }

    public static void main(String[] args) {
        System.out.println(numSubarraysWithSum(new int[]{1,0,1,0,1}, 2)); // 4
        System.out.println(numSubarraysWithSum(new int[]{0,0,0,0,0}, 0)); // 15
    }
}
```

---

## M10. Count Number of Nice Subarrays

**LeetCode #1248** | **Pattern:** Same atMost trick for exactly k odd numbers

```java
public class CountNiceSubarrays {
    public static int numberOfSubarrays(int[] nums, int k) {
        return atMost(nums, k) - atMost(nums, k - 1);
    }

    private static int atMost(int[] nums, int k) {
        int left = 0, odds = 0, count = 0;
        for (int right = 0; right < nums.length; right++) {
            if (nums[right] % 2 == 1) odds++;
            while (odds > k) {
                if (nums[left++] % 2 == 1) odds--;
            }
            count += right - left + 1;
        }
        return count;
    }

    public static void main(String[] args) {
        System.out.println(numberOfSubarrays(new int[]{1,1,2,1,1}, 3)); // 2
        System.out.println(numberOfSubarrays(new int[]{2,4,6}, 1));     // 0
        System.out.println(numberOfSubarrays(new int[]{2,2,2,1,2,2,1,2,2,2}, 2)); // 16
    }
}
```

---

## M11. Grumpy Bookstore Owner

**LeetCode #1052** | **Pattern:** Fixed Window — maximize extra customers

**Problem:** Owner is grumpy for some minutes. Using a secret technique for K consecutive minutes, he's not grumpy. Maximize satisfied customers.

```java
public class GrumpyBookstoreOwner {
    public static int maxSatisfied(int[] customers, int[] grumpy, int minutes) {
        int n = customers.length;
        // Always-satisfied (when not grumpy)
        int base = 0;
        for (int i = 0; i < n; i++)
            if (grumpy[i] == 0) base += customers[i];

        // Find window of size minutes that maximises extra customers (when grumpy)
        int extra = 0;
        for (int i = 0; i < minutes; i++)
            if (grumpy[i] == 1) extra += customers[i];

        int maxExtra = extra;
        for (int i = minutes; i < n; i++) {
            if (grumpy[i] == 1)     extra += customers[i];
            if (grumpy[i - minutes] == 1) extra -= customers[i - minutes];
            maxExtra = Math.max(maxExtra, extra);
        }
        return base + maxExtra;
    }

    public static void main(String[] args) {
        System.out.println(maxSatisfied(
            new int[]{1,0,1,2,1,1,7,5},
            new int[]{0,1,0,1,0,1,0,1}, 3)); // 16
    }
}
```

---

## M12. Longest Turbulent Subarray

**LeetCode #978** | **Pattern:** Variable Window — up-down-up alternating

```java
public class LongestTurbulentSubarray {
    public static int maxTurbulenceSize(int[] arr) {
        int left = 0, maxLen = 1;

        for (int right = 1; right < arr.length; right++) {
            int cmp = Integer.compare(arr[right], arr[right - 1]);
            if (cmp == 0) {
                left = right; // equal — restart
            } else if (right > 1) {
                int prevCmp = Integer.compare(arr[right-1], arr[right-2]);
                if (cmp == prevCmp) left = right - 1; // same direction — shrink
            }
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }

    public static void main(String[] args) {
        System.out.println(maxTurbulenceSize(new int[]{9,4,2,10,7,8,8,1,9})); // 5
        System.out.println(maxTurbulenceSize(new int[]{4,8,12,16}));           // 2
        System.out.println(maxTurbulenceSize(new int[]{100}));                 // 1
    }
}
```

---

## M13. Maximum Erasure Value

**LeetCode #1695** | **Pattern:** Variable Window — max sum of unique elements

**Problem:** Erase one subarray containing unique elements. Maximize sum.

```java
import java.util.*;

public class MaximumErasureValue {
    public static int maximumUniqueSubarray(int[] nums) {
        Set<Integer> seen = new HashSet<>();
        int left = 0, sum = 0, maxSum = 0;

        for (int right = 0; right < nums.length; right++) {
            while (seen.contains(nums[right])) {
                seen.remove(nums[left]);
                sum -= nums[left++];
            }
            seen.add(nums[right]);
            sum += nums[right];
            maxSum = Math.max(maxSum, sum);
        }
        return maxSum;
    }

    public static void main(String[] args) {
        System.out.println(maximumUniqueSubarray(new int[]{4,2,4,5,6}));       // 17
        System.out.println(maximumUniqueSubarray(new int[]{5,2,1,2,5,2,1,2,5})); // 8
    }
}
```

---

## M14. Get Equal Substrings Within Budget

**LeetCode #1208** | **Pattern:** Variable Window — max length within cost budget

```java
public class GetEqualSubstringsWithinBudget {
    public static int equalSubstring(String s, String t, int maxCost) {
        int left = 0, cost = 0, maxLen = 0;

        for (int right = 0; right < s.length(); right++) {
            cost += Math.abs(s.charAt(right) - t.charAt(right));
            while (cost > maxCost)
                cost -= Math.abs(s.charAt(left++) - t.charAt(left - 1));
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }

    public static void main(String[] args) {
        System.out.println(equalSubstring("abcd", "bcdf", 3)); // 3
        System.out.println(equalSubstring("abcd", "cdef", 3)); // 1
    }
}
```

---

## M15. Longest Harmonious Subsequence

**LeetCode #594** | **Pattern:** Fixed Window on sorted/hash approach

**Problem:** Subsequence where max - min = 1. Find longest.

```java
import java.util.*;

public class LongestHarmoniousSubsequence {
    public static int findLHS(int[] nums) {
        Map<Integer, Integer> freq = new HashMap<>();
        for (int n : nums) freq.merge(n, 1, Integer::sum);

        int maxLen = 0;
        for (int key : freq.keySet()) {
            if (freq.containsKey(key + 1))
                maxLen = Math.max(maxLen, freq.get(key) + freq.get(key + 1));
        }
        return maxLen;
    }

    public static void main(String[] args) {
        System.out.println(findLHS(new int[]{1,3,2,2,5,2,3,7})); // 5
        System.out.println(findLHS(new int[]{1,2,3,4}));           // 2
        System.out.println(findLHS(new int[]{1,1,1,1}));           // 0
    }
}
```

---

## M16. Replace the Substring for Balanced String

**LeetCode #1234** | **Pattern:** Variable Window — minimum window to replace

```java
public class ReplaceSubstringBalanced {
    public static int balancedString(String s) {
        int n = s.length(), k = n / 4;
        int[] freq = new int[26];
        for (char c : s.toCharArray()) freq[c - 'A']++;

        if (freq['Q'-'A'] == k && freq['W'-'A'] == k
            && freq['E'-'A'] == k && freq['R'-'A'] == k) return 0;

        int left = 0, minLen = n;
        for (int right = 0; right < n; right++) {
            freq[s.charAt(right) - 'A']--;
            while (left <= right
                   && freq['Q'-'A'] <= k && freq['W'-'A'] <= k
                   && freq['E'-'A'] <= k && freq['R'-'A'] <= k) {
                minLen = Math.min(minLen, right - left + 1);
                freq[s.charAt(left++) - 'A']++;
            }
        }
        return minLen;
    }

    public static void main(String[] args) {
        System.out.println(balancedString("QWER")); // 0
        System.out.println(balancedString("QQWE")); // 1
        System.out.println(balancedString("QQQW")); // 2
    }
}
```

---

## M17. Repeated DNA Sequences

**LeetCode #187** | **Pattern:** Fixed Window + HashSet

**Problem:** Find all 10-letter-long sequences that appear more than once in DNA string.

```java
import java.util.*;

public class RepeatedDNASequences {
    public static List<String> findRepeatedDnaSequences(String s) {
        List<String> result = new ArrayList<>();
        if (s.length() <= 10) return result;

        Set<String> seen = new HashSet<>();
        Set<String> repeated = new HashSet<>();

        for (int i = 0; i <= s.length() - 10; i++) {
            String sub = s.substring(i, i + 10);
            if (!seen.add(sub)) repeated.add(sub);
        }
        return new ArrayList<>(repeated);
    }

    public static void main(String[] args) {
        System.out.println(findRepeatedDnaSequences("AAAAACCCCCAAAAACCCCCCAAAAAGGGTTT"));
        // [AAAAACCCCC, CCCCCAAAAA]
    }
}
```

---

## M18. Find K-Length Substrings With No Repeated Characters

**LeetCode #1100** | **Pattern:** Fixed Window + HashSet

```java
import java.util.*;

public class KLengthNoRepeat {
    public static int numKLenSubstrNoRepeats(String s, int k) {
        if (k > s.length()) return 0;
        Set<Character> window = new HashSet<>();
        int count = 0, left = 0;

        for (int right = 0; right < s.length(); right++) {
            while (window.contains(s.charAt(right)))
                window.remove(s.charAt(left++));
            window.add(s.charAt(right));
            if (right - left + 1 == k) {
                count++;
                window.remove(s.charAt(left++));
            }
        }
        return count;
    }

    public static void main(String[] args) {
        System.out.println(numKLenSubstrNoRepeats("havefunonleetcode", 5)); // 6
        System.out.println(numKLenSubstrNoRepeats("home", 5)); // 0
    }
}
```

---

## M19. Count Occurrences of Anagrams

**Pattern:** Fixed Window + Frequency Array (variant of E7)

```java
import java.util.*;

public class CountOccurrencesAnagrams {
    public static int search(String txt, String pat) {
        int[] need = new int[26], window = new int[26];
        int k = pat.length(), count = 0;
        for (char c : pat.toCharArray()) need[c - 'a']++;
        for (int i = 0; i < k; i++) window[txt.charAt(i) - 'a']++;
        if (Arrays.equals(need, window)) count++;
        for (int i = k; i < txt.length(); i++) {
            window[txt.charAt(i) - 'a']++;
            window[txt.charAt(i - k) - 'a']--;
            if (Arrays.equals(need, window)) count++;
        }
        return count;
    }

    public static void main(String[] args) {
        System.out.println(search("forxxorfxdofr", "for")); // 3
        System.out.println(search("aabaabaa", "aaba"));     // 4
    }
}
```

---

## M20. Number of Substrings Containing All Three Characters

**LeetCode #1358** | **Pattern:** Variable Window — count valid substrings

**Key Insight:** Once window contains a,b,c, ALL extensions to the right are also valid.

```java
public class SubstringsWithAllThreeChars {
    public static int numberOfSubstrings(String s) {
        int[] freq = new int[3]; // a, b, c
        int left = 0, count = 0;

        for (int right = 0; right < s.length(); right++) {
            freq[s.charAt(right) - 'a']++;

            // Shrink while all three present
            while (freq[0] > 0 && freq[1] > 0 && freq[2] > 0) {
                // All substrings from left..right to end are valid
                count += s.length() - right;
                freq[s.charAt(left++) - 'a']--;
            }
        }
        return count;
    }

    public static void main(String[] args) {
        System.out.println(numberOfSubstrings("abcabc")); // 10
        System.out.println(numberOfSubstrings("aaacb"));  // 3
        System.out.println(numberOfSubstrings("abc"));    // 1
    }
}
```

---

## M21. Subarrays with Product Less Than K

**LeetCode #713** | **Pattern:** Variable Window — count subarrays with product < K

```java
public class SubarraysProductLessK {
    public static int numSubarrayProductLessThanK(int[] nums, int k) {
        if (k <= 1) return 0;
        int left = 0, product = 1, count = 0;

        for (int right = 0; right < nums.length; right++) {
            product *= nums[right];
            while (product >= k) product /= nums[left++];
            // All subarrays ending at right starting from left..right
            count += right - left + 1;
        }
        return count;
    }

    public static void main(String[] args) {
        System.out.println(numSubarrayProductLessThanK(new int[]{10,5,2,6}, 100)); // 8
        System.out.println(numSubarrayProductLessThanK(new int[]{1,2,3}, 0));      // 0
    }
}
```

---

## M22. Minimum Recolors to Get K Consecutive Black Blocks

**LeetCode #2379** | **Pattern:** Fixed Window — count whites in window

```java
public class MinRecolorsKBlack {
    public static int minimumRecolors(String blocks, int k) {
        int whites = 0;
        for (int i = 0; i < k; i++) if (blocks.charAt(i) == 'W') whites++;
        int minOps = whites;
        for (int i = k; i < blocks.length(); i++) {
            if (blocks.charAt(i) == 'W') whites++;
            if (blocks.charAt(i - k) == 'W') whites--;
            minOps = Math.min(minOps, whites);
        }
        return minOps;
    }

    public static void main(String[] args) {
        System.out.println(minimumRecolors("WBBWWBBWBW", 7)); // 3
        System.out.println(minimumRecolors("WBWBBBW", 2));    // 0
    }
}
```

---

## M23. Max Consecutive Answers

**LeetCode #2024** | **Pattern:** Variable Window — allow at most K wrong answers

```java
public class MaxConsecutiveAnswers {
    public static int maxConsecutiveAnswers(String answerKey, int k) {
        return Math.max(maxLen(answerKey, k, 'T'), maxLen(answerKey, k, 'F'));
    }

    private static int maxLen(String s, int k, char flip) {
        int left = 0, flips = 0, maxLen = 0;
        for (int right = 0; right < s.length(); right++) {
            if (s.charAt(right) == flip) flips++;
            while (flips > k) {
                if (s.charAt(left++) == flip) flips--;
            }
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }

    public static void main(String[] args) {
        System.out.println(maxConsecutiveAnswers("TTFF", 2));     // 4
        System.out.println(maxConsecutiveAnswers("TFFT", 1));     // 3
        System.out.println(maxConsecutiveAnswers("TTFTTFTT", 1)); // 5
    }
}
```

---

## M24. Frequency of the Most Frequent Element

**LeetCode #1838** | **Pattern:** Sort + Variable Window

**Problem:** Increment elements by at most k total operations. Maximize frequency of any element.

```java
import java.util.*;

public class FrequencyMostFrequent {
    public static int maxFrequency(int[] nums, int k) {
        Arrays.sort(nums);
        int left = 0, maxFreq = 1;
        long windowSum = 0;

        for (int right = 1; right < nums.length; right++) {
            // Cost to make all elements in window equal to nums[right]
            windowSum += (long)(nums[right] - nums[right - 1]) * (right - left);

            while (windowSum > k) {
                windowSum -= nums[right] - nums[left++];
            }
            maxFreq = Math.max(maxFreq, right - left + 1);
        }
        return maxFreq;
    }

    public static void main(String[] args) {
        System.out.println(maxFrequency(new int[]{1,2,4}, 5));        // 3
        System.out.println(maxFrequency(new int[]{1,4,8,13}, 5));     // 2
        System.out.println(maxFrequency(new int[]{3,9,6}, 2));        // 1
    }
}
```

---

## M25. Number of Smooth Descent Periods of a Stock

**LeetCode #2110** | **Pattern:** Variable Window — count periods where prices decrease by 1 each day

```java
public class SmoothDescentPeriods {
    public static long getDescentPeriods(int[] prices) {
        long count = 1, run = 1;
        for (int i = 1; i < prices.length; i++) {
            if (prices[i] == prices[i - 1] - 1) run++;
            else run = 1;
            count += run; // each extension adds run new valid subarrays
        }
        return count;
    }

    public static void main(String[] args) {
        System.out.println(getDescentPeriods(new int[]{3,2,1,4})); // 7
        System.out.println(getDescentPeriods(new int[]{8,6,7,7})); // 4
        System.out.println(getDescentPeriods(new int[]{1}));        // 1
    }
}
```

---

## M26. Minimum Swaps to Group All 1's Together

**LeetCode #1151** | **Pattern:** Fixed Window — count zeros in window of size = total ones

```java
public class MinSwapsGroup1s {
    public static int minSwaps(int[] data) {
        int totalOnes = 0;
        for (int d : data) totalOnes += d;
        if (totalOnes == 0 || totalOnes == data.length) return 0;

        int zerosInWindow = 0;
        for (int i = 0; i < totalOnes; i++)
            if (data[i] == 0) zerosInWindow++;
        int minZeros = zerosInWindow;

        for (int i = totalOnes; i < data.length; i++) {
            if (data[i] == 0) zerosInWindow++;
            if (data[i - totalOnes] == 0) zerosInWindow--;
            minZeros = Math.min(minZeros, zerosInWindow);
        }
        return minZeros; // minimum swaps = minimum zeros in any window
    }

    public static void main(String[] args) {
        System.out.println(minSwaps(new int[]{1,0,1,0,1})); // 1
        System.out.println(minSwaps(new int[]{0,0,0,1,0})); // 0
        System.out.println(minSwaps(new int[]{1,0,1,0,1,0,0,1,1,0,1})); // 3
    }
}
```

---

## M27. Longest Subarray of 1's After Deleting One Element

**LeetCode #1493** | **Pattern:** Variable Window — allow at most one 0

```java
public class LongestSubarrayAfterDelete {
    public static int longestSubarray(int[] nums) {
        int left = 0, zeros = 0, maxLen = 0;
        for (int right = 0; right < nums.length; right++) {
            if (nums[right] == 0) zeros++;
            while (zeros > 1) {
                if (nums[left++] == 0) zeros--;
            }
            maxLen = Math.max(maxLen, right - left); // -1 for the deleted element
        }
        return maxLen;
    }

    public static void main(String[] args) {
        System.out.println(longestSubarray(new int[]{1,1,0,1}));       // 3
        System.out.println(longestSubarray(new int[]{0,1,1,1,0,1,1,0,1})); // 5
        System.out.println(longestSubarray(new int[]{1,1,1}));         // 2
    }
}
```

---

## M28. Minimum Operations to Reduce X to Zero

**LeetCode #1658** | **Pattern:** Find max middle subarray with sum = total - x

```java
public class MinOpsReduceXToZero {
    public static int minOperations(int[] nums, int x) {
        int total = 0;
        for (int n : nums) total += n;
        int target = total - x;
        if (target < 0) return -1;
        if (target == 0) return nums.length;

        int maxMid = -1, left = 0, sum = 0;
        for (int right = 0; right < nums.length; right++) {
            sum += nums[right];
            while (sum > target) sum -= nums[left++];
            if (sum == target) maxMid = Math.max(maxMid, right - left + 1);
        }
        return maxMid == -1 ? -1 : nums.length - maxMid;
    }

    public static void main(String[] args) {
        System.out.println(minOperations(new int[]{1,1,4,2,3}, 5));      // 2
        System.out.println(minOperations(new int[]{5,6,7,8,9}, 4));      // -1
        System.out.println(minOperations(new int[]{3,2,20,1,1,3}, 10));  // 5
    }
}
```

---

## M29. Longest Semi-Repetitive Substring

**LeetCode #2730** | **Pattern:** Variable Window — at most one pair of adjacent duplicates

```java
public class LongestSemiRepetitiveSubstring {
    public static int longestSemiRepetitiveSubstring(String s) {
        int left = 0, pairs = 0, maxLen = 1;
        for (int right = 1; right < s.length(); right++) {
            if (s.charAt(right) == s.charAt(right - 1)) pairs++;
            while (pairs > 1) {
                if (s.charAt(left) == s.charAt(left + 1)) pairs--;
                left++;
            }
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }

    public static void main(String[] args) {
        System.out.println(longestSemiRepetitiveSubstring("52233"));  // 4
        System.out.println(longestSemiRepetitiveSubstring("5494"));   // 4
        System.out.println(longestSemiRepetitiveSubstring("1111111")); // 2
    }
}
```

---

## M30. Count Complete Subarrays in an Array

**LeetCode #2799** | **Pattern:** Variable Window — subarrays with same distinct count as full array

```java
import java.util.*;

public class CountCompleteSubarrays {
    public static int countCompleteSubarrays(int[] nums) {
        Set<Integer> allDistinct = new HashSet<>();
        for (int n : nums) allDistinct.add(n);
        int k = allDistinct.size(), count = 0;

        Map<Integer, Integer> window = new HashMap<>();
        int left = 0;
        for (int right = 0; right < nums.length; right++) {
            window.merge(nums[right], 1, Integer::sum);
            while (window.size() == k) {
                count += nums.length - right; // all extensions valid
                int lv = nums[left++];
                window.put(lv, window.get(lv) - 1);
                if (window.get(lv) == 0) window.remove(lv);
            }
        }
        return count;
    }

    public static void main(String[] args) {
        System.out.println(countCompleteSubarrays(new int[]{1,3,1,2,2})); // 4
        System.out.println(countCompleteSubarrays(new int[]{5,5,5,5}));   // 10
    }
}
```

---
---

# PART 3 — HARD PROBLEMS (1–20)

---

## H1. Sliding Window Median

**LeetCode #480** | **Pattern:** Two Heaps (Max-Heap + Min-Heap)

**Problem:** Return median of every window of size K.

**Key Idea:** Maintain two heaps:
- Max-heap for lower half (top = lower median)
- Min-heap for upper half (top = upper median)

**Time:** O(n log k) | **Space:** O(k)

```java
import java.util.*;

public class SlidingWindowMedian {
    // Max-heap for lower half, min-heap for upper half
    private final PriorityQueue<Integer> lo = new PriorityQueue<>(Collections.reverseOrder());
    private final PriorityQueue<Integer> hi = new PriorityQueue<>();

    public double[] medianSlidingWindow(int[] nums, int k) {
        double[] result = new double[nums.length - k + 1];

        for (int i = 0; i < nums.length; i++) {
            add(nums[i]);
            rebalance();

            if (i >= k - 1) {
                result[i - k + 1] = getMedian(k);
                remove(nums[i - k + 1]);
                rebalance();
            }
        }
        return result;
    }

    private void add(int num) {
        if (lo.isEmpty() || num <= lo.peek()) lo.offer(num);
        else hi.offer(num);
    }

    private void rebalance() {
        // Keep lo.size() == hi.size() or lo.size() == hi.size()+1
        while (lo.size() > hi.size() + 1) hi.offer(lo.poll());
        while (hi.size() > lo.size())     lo.offer(hi.poll());
    }

    private double getMedian(int k) {
        return k % 2 == 0
            ? ((double) lo.peek() + hi.peek()) / 2.0
            : lo.peek();
    }

    private void remove(int num) {
        if (num <= lo.peek()) lo.remove(num);
        else                  hi.remove(num);
    }

    public static void main(String[] args) {
        SlidingWindowMedian swm = new SlidingWindowMedian();
        System.out.println(Arrays.toString(
            swm.medianSlidingWindow(new int[]{1,3,-1,-3,5,3,6,7}, 3)));
        // [1.0,-1.0,-1.0,3.0,5.0,6.0]
    }
}
```

---

## H2. Minimum Window Subsequence

**LeetCode #727** | **Pattern:** Two-pass sliding window

**Problem:** Find minimum window in `s1` that contains `s2` as a subsequence (order matters).

**Time:** O(|s1| * |s2|) | **Space:** O(1)

```java
public class MinWindowSubsequence {
    public static String minWindowSubseq(String s1, String s2) {
        int minLen = Integer.MAX_VALUE;
        String result = "";
        int i = 0;

        while (i < s1.length()) {
            // Forward pass: find end of window containing s2
            int j = 0;
            while (i < s1.length() && j < s2.length()) {
                if (s1.charAt(i) == s2.charAt(j)) j++;
                i++;
            }
            if (j < s2.length()) break; // s2 not found

            // Backward pass: shrink from end to find minimum start
            int end = i;
            j = s2.length() - 1;
            while (j >= 0) {
                if (s1.charAt(--i) == s2.charAt(j)) j--;
            }
            // i is now at start of minimum window
            if (end - i < minLen) {
                minLen = end - i;
                result = s1.substring(i, end);
            }
            i++; // move start to try next window
        }
        return result;
    }

    public static void main(String[] args) {
        System.out.println(minWindowSubseq("abcdebdde", "bde")); // "bcde"
        System.out.println(minWindowSubseq("jmeqksfrsdcmsiwvaovztaqenprpvnbstl", "u")); // ""
    }
}
```

---

## H3. Shortest Subarray with Sum at Least K

**LeetCode #862** | **Pattern:** Prefix Sum + Monotonic Deque

**Problem:** Find shortest subarray with sum ≥ K. Can have NEGATIVE numbers (makes variable window fail).

**Key Insight:** Use prefix sums + deque to maintain candidates for left boundary.

**Time:** O(n) | **Space:** O(n)

```java
import java.util.*;

public class ShortestSubarraySumAtLeastK {
    public static int shortestSubarray(int[] nums, int k) {
        int n = nums.length;
        long[] prefix = new long[n + 1];
        for (int i = 0; i < n; i++) prefix[i + 1] = prefix[i] + nums[i];

        int minLen = Integer.MAX_VALUE;
        Deque<Integer> dq = new ArrayDeque<>(); // indices into prefix

        for (int i = 0; i <= n; i++) {
            // Try to shrink from left: prefix[i] - prefix[dq.front] >= k
            while (!dq.isEmpty() && prefix[i] - prefix[dq.peekFirst()] >= k)
                minLen = Math.min(minLen, i - dq.pollFirst());

            // Remove indices with prefix >= prefix[i] (they can never give shorter window)
            while (!dq.isEmpty() && prefix[dq.peekLast()] >= prefix[i])
                dq.pollLast();

            dq.offerLast(i);
        }
        return minLen == Integer.MAX_VALUE ? -1 : minLen;
    }

    public static void main(String[] args) {
        System.out.println(shortestSubarray(new int[]{1}, 1));           // 1
        System.out.println(shortestSubarray(new int[]{1,2}, 4));         // -1
        System.out.println(shortestSubarray(new int[]{2,-1,2}, 3));      // 3
        System.out.println(shortestSubarray(new int[]{84,-37,32,40,95}, 167)); // 3
    }
}
```

---

## H4. Subarrays with K Different Integers

**LeetCode #992** | **Pattern:** atMost(K) - atMost(K-1)

**Problem:** Count subarrays with EXACTLY K different integers.

```java
import java.util.*;

public class SubarraysKDifferent {
    public static int subarraysWithKDistinct(int[] nums, int k) {
        return atMost(nums, k) - atMost(nums, k - 1);
    }

    private static int atMost(int[] nums, int k) {
        Map<Integer, Integer> freq = new HashMap<>();
        int left = 0, count = 0;
        for (int right = 0; right < nums.length; right++) {
            freq.merge(nums[right], 1, Integer::sum);
            while (freq.size() > k) {
                int lv = nums[left++];
                freq.put(lv, freq.get(lv) - 1);
                if (freq.get(lv) == 0) freq.remove(lv);
            }
            count += right - left + 1;
        }
        return count;
    }

    public static void main(String[] args) {
        System.out.println(subarraysWithKDistinct(new int[]{1,2,1,2,3}, 2)); // 7
        System.out.println(subarraysWithKDistinct(new int[]{1,2,1,3,4}, 3)); // 3
    }
}
```

---

## H5. Longest Continuous Subarray with Absolute Diff ≤ Limit

**LeetCode #1438** | **Pattern:** Two Monotonic Deques (max + min)

**Time:** O(n) | **Space:** O(n)

```java
import java.util.*;

public class LongestSubarrayAbsDiffLimit {
    public static int longestSubarray(int[] nums, int limit) {
        Deque<Integer> maxDq = new ArrayDeque<>(); // decreasing (max at front)
        Deque<Integer> minDq = new ArrayDeque<>(); // increasing (min at front)
        int left = 0, maxLen = 0;

        for (int right = 0; right < nums.length; right++) {
            // Maintain max deque
            while (!maxDq.isEmpty() && nums[maxDq.peekLast()] <= nums[right])
                maxDq.pollLast();
            maxDq.offerLast(right);

            // Maintain min deque
            while (!minDq.isEmpty() && nums[minDq.peekLast()] >= nums[right])
                minDq.pollLast();
            minDq.offerLast(right);

            // Shrink window if max - min > limit
            while (nums[maxDq.peekFirst()] - nums[minDq.peekFirst()] > limit) {
                left++;
                if (maxDq.peekFirst() < left) maxDq.pollFirst();
                if (minDq.peekFirst() < left) minDq.pollFirst();
            }
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }

    public static void main(String[] args) {
        System.out.println(longestSubarray(new int[]{8,2,4,7}, 4));         // 2
        System.out.println(longestSubarray(new int[]{10,1,2,4,7,2}, 5));    // 4
        System.out.println(longestSubarray(new int[]{4,2,2,2,4,4,2,2}, 0)); // 3
    }
}
```

---

## H6. Minimum Number of K Consecutive Bit Flips

**LeetCode #995** | **Pattern:** Sliding Window Flip Tracking

**Problem:** Flip exactly K consecutive elements. Minimize flips to make all 1s.

**Time:** O(n) | **Space:** O(n)

```java
public class MinKConsecutiveBitFlips {
    public static int minKBitFlips(int[] nums, int k) {
        int n = nums.length;
        int[] diff = new int[n + 1]; // diff array to track active flips
        int flips = 0, result = 0;

        for (int i = 0; i < n; i++) {
            flips += diff[i]; // apply accumulated flips
            // Current value after all flips
            if ((nums[i] + flips) % 2 == 0) { // still 0 — need to flip
                if (i + k > n) return -1; // not enough space
                result++;
                flips++;
                diff[i + k]--; // flip ends at i+k
            }
        }
        return result;
    }

    public static void main(String[] args) {
        System.out.println(minKBitFlips(new int[]{0,1,0}, 1));            // 2
        System.out.println(minKBitFlips(new int[]{1,1,0}, 2));            // -1
        System.out.println(minKBitFlips(new int[]{0,0,0,1,0,1,1,0}, 3)); // 3
    }
}
```

---

## H7. Smallest Range Covering Elements from K Lists

**LeetCode #632** | **Pattern:** Sliding Window on merged sorted stream + PriorityQueue

**Time:** O(n log k) | **Space:** O(k)

```java
import java.util.*;

public class SmallestRangeKLists {
    public static int[] smallestRange(List<List<Integer>> nums) {
        // Min-heap: [value, listIndex, elementIndex]
        PriorityQueue<int[]> minHeap = new PriorityQueue<>((a, b) -> a[0] - b[0]);
        int curMax = Integer.MIN_VALUE;

        for (int i = 0; i < nums.size(); i++) {
            minHeap.offer(new int[]{nums.get(i).get(0), i, 0});
            curMax = Math.max(curMax, nums.get(i).get(0));
        }

        int[] result = {0, Integer.MAX_VALUE};
        while (minHeap.size() == nums.size()) {
            int[] curr = minHeap.poll();
            int val = curr[0], li = curr[1], ei = curr[2];

            if (curMax - val < result[1] - result[0]) {
                result[0] = val; result[1] = curMax;
            }

            if (ei + 1 < nums.get(li).size()) {
                int next = nums.get(li).get(ei + 1);
                minHeap.offer(new int[]{next, li, ei + 1});
                curMax = Math.max(curMax, next);
            }
        }
        return result;
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(smallestRange(Arrays.asList(
            Arrays.asList(4,10,15,24,26),
            Arrays.asList(0,9,12,20),
            Arrays.asList(5,18,22,30)))));
        // [20, 24]
    }
}
```

---

## H8. Constrained Subsequence Sum

**LeetCode #1425** | **Pattern:** DP + Monotonic Deque

**Problem:** Max sum subsequence where consecutive chosen indices differ by at most k.

```java
import java.util.*;

public class ConstrainedSubsequenceSum {
    public static int constrainedSubsetSum(int[] nums, int k) {
        int n = nums.length;
        int[] dp = new int[n];
        Deque<Integer> dq = new ArrayDeque<>(); // indices, decreasing dp values
        int result = nums[0];

        for (int i = 0; i < n; i++) {
            // dp[i] = max(0, max(dp[i-k..i-1])) + nums[i]
            dp[i] = nums[i] + (dq.isEmpty() ? 0 : Math.max(0, dp[dq.peekFirst()]));
            result = Math.max(result, dp[i]);

            // Remove front if out of window
            while (!dq.isEmpty() && dq.peekFirst() < i - k + 1) dq.pollFirst();
            // Maintain decreasing order
            while (!dq.isEmpty() && dp[dq.peekLast()] <= dp[i]) dq.pollLast();
            dq.offerLast(i);
        }
        return result;
    }

    public static void main(String[] args) {
        System.out.println(constrainedSubsetSum(new int[]{10,2,-10,5,20}, 2));  // 37
        System.out.println(constrainedSubsetSum(new int[]{-1,-2,-3}, 1));       // -1
        System.out.println(constrainedSubsetSum(new int[]{10,-2,-10,-5,20}, 2)); // 23
    }
}
```

---

## H9. Jump Game VI

**LeetCode #1696** | **Pattern:** DP + Monotonic Deque (max in last k)

```java
import java.util.*;

public class JumpGameVI {
    public static int maxResult(int[] nums, int k) {
        int n = nums.length;
        int[] dp = new int[n];
        dp[0] = nums[0];
        Deque<Integer> dq = new ArrayDeque<>();
        dq.offerLast(0);

        for (int i = 1; i < n; i++) {
            // Remove stale front
            while (!dq.isEmpty() && dq.peekFirst() < i - k) dq.pollFirst();
            dp[i] = dp[dq.peekFirst()] + nums[i];
            // Maintain decreasing dp values
            while (!dq.isEmpty() && dp[dq.peekLast()] <= dp[i]) dq.pollLast();
            dq.offerLast(i);
        }
        return dp[n - 1];
    }

    public static void main(String[] args) {
        System.out.println(maxResult(new int[]{1,-1,-2,4,-7,3}, 2));          // 7
        System.out.println(maxResult(new int[]{10,-5,-2,4,0,3}, 3));          // 17
        System.out.println(maxResult(new int[]{1,-5,-20,4,-1,3,-6,-3}, 2));   // 0
    }
}
```

---

## H10. Count Subarrays with Fixed Bounds

**LeetCode #2444** | **Pattern:** Three-pointer tracking

**Problem:** Count subarrays where min = minK and max = maxK.

```java
public class CountSubarraysFixedBounds {
    public static long countSubarrays(int[] nums, int minK, int maxK) {
        long count = 0;
        int lastMin = -1, lastMax = -1, lastBad = -1;

        for (int i = 0; i < nums.length; i++) {
            if (nums[i] < minK || nums[i] > maxK) lastBad = i; // out of range
            if (nums[i] == minK) lastMin = i;
            if (nums[i] == maxK) lastMax = i;
            // Number of valid subarrays ending at i
            count += Math.max(0L, Math.min(lastMin, lastMax) - lastBad);
        }
        return count;
    }

    public static void main(String[] args) {
        System.out.println(countSubarrays(new int[]{1,3,5,2,7,5}, 1, 5)); // 2
        System.out.println(countSubarrays(new int[]{1,1,1,1}, 1, 1));     // 10
    }
}
```

---

## H11. Minimum Cost to Equalize Array

**LeetCode #3107** | **Pattern:** Sliding window on sorted differences

```java
import java.util.*;

public class MinCostToEqualizeArray {
    public static int minCostToEqualizeArray(int[] nums, int cost1, int cost2) {
        final int MOD = 1_000_000_007;
        int n = nums.length;
        int maxVal = Arrays.stream(nums).max().getAsInt();
        long totalNeeded = (long) maxVal * n;
        for (int x : nums) totalNeeded -= x;

        if (cost1 * 2 <= cost2 || n <= 2) {
            return (int)((totalNeeded % MOD * cost1) % MOD);
        }

        long ans = Long.MAX_VALUE;
        long pairs = 0, singles = 0;
        // Sort deficits and use sliding window to find max pairable
        int[] deficit = new int[n];
        for (int i = 0; i < n; i++) deficit[i] = maxVal - nums[i];
        Arrays.sort(deficit);

        long prefSum = 0;
        for (int right = 0; right < n; right++) {
            prefSum += deficit[right];
            long windowSum = prefSum;
            // Try to pair: largest element pairs with others
            long large = deficit[right];
            long rest  = windowSum - large;
            long canPair = Math.min(large, rest);
            long cost = canPair * cost2 + (windowSum - 2 * canPair) * cost1;
            ans = Math.min(ans, cost);
        }
        return (int)(ans % MOD);
    }

    public static void main(String[] args) {
        System.out.println(minCostToEqualizeArray(new int[]{4,1}, 5, 2)); // 0 (already equal? no: 15)
        System.out.println(minCostToEqualizeArray(new int[]{2,3,3,3,5}, 2, 3)); // 6
    }
}
```

---

## H12. Count the Number of Good Subarrays

**LeetCode #2537** | **Pattern:** Variable Window — count pairs of equal elements

```java
import java.util.*;

public class CountGoodSubarrays {
    public static long countGood(int[] nums, int k) {
        Map<Integer, Integer> freq = new HashMap<>();
        long count = 0, pairs = 0;
        int left = 0;

        for (int right = 0; right < nums.length; right++) {
            pairs += freq.getOrDefault(nums[right], 0);
            freq.merge(nums[right], 1, Integer::sum);

            while (pairs >= k) {
                count += nums.length - right; // all extensions valid
                freq.put(nums[left], freq.get(nums[left]) - 1);
                pairs -= freq.get(nums[left]);
                left++;
            }
        }
        return count;
    }

    public static void main(String[] args) {
        System.out.println(countGood(new int[]{1,1,1,1,1}, 10)); // 1
        System.out.println(countGood(new int[]{3,1,4,3,2,2,4}, 2)); // 4
    }
}
```

---

## H13. Longest Nice Subarray

**LeetCode #2401** | **Pattern:** Variable Window + Bitmasking

**Problem:** Subarray is "nice" if AND of every pair of elements = 0 (no shared bits).

```java
public class LongestNiceSubarray {
    public static int longestNiceSubarray(int[] nums) {
        int left = 0, usedBits = 0, maxLen = 1;

        for (int right = 0; right < nums.length; right++) {
            // Remove elements that share bits with nums[right]
            while ((usedBits & nums[right]) != 0) {
                usedBits ^= nums[left++]; // remove left's bits
            }
            usedBits |= nums[right]; // add right's bits
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }

    public static void main(String[] args) {
        System.out.println(longestNiceSubarray(new int[]{1,3,8,48,10})); // 3
        System.out.println(longestNiceSubarray(new int[]{3,1,5,11,13})); // 1
    }
}
```

---

## H14. Maximize the Confusion of an Exam

**LeetCode #2024** | **Pattern:** Variable Window — max run with at most K flips

```java
public class MaximizeConfusion {
    public static int maxConsecutiveAnswers(String answerKey, int k) {
        return Math.max(maxRun(answerKey, k, 'T'), maxRun(answerKey, k, 'F'));
    }

    private static int maxRun(String s, int k, char target) {
        int left = 0, changes = 0, maxLen = 0;
        for (int right = 0; right < s.length(); right++) {
            if (s.charAt(right) != target) changes++;
            while (changes > k) {
                if (s.charAt(left++) != target) changes--;
            }
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }

    public static void main(String[] args) {
        System.out.println(maxConsecutiveAnswers("TTFF", 2));     // 4
        System.out.println(maxConsecutiveAnswers("TFFT", 1));     // 3
        System.out.println(maxConsecutiveAnswers("TTFTTFTT", 1)); // 5
    }
}
```

---

## H15. Continuous Subarrays

**LeetCode #2762** | **Pattern:** Variable Window with Two Monotonic Deques

```java
import java.util.*;

public class ContinuousSubarrays {
    public static long continuousSubarrays(int[] nums) {
        Deque<Integer> maxDq = new ArrayDeque<>();
        Deque<Integer> minDq = new ArrayDeque<>();
        int left = 0;
        long count = 0;

        for (int right = 0; right < nums.length; right++) {
            while (!maxDq.isEmpty() && nums[maxDq.peekLast()] <= nums[right])
                maxDq.pollLast();
            while (!minDq.isEmpty() && nums[minDq.peekLast()] >= nums[right])
                minDq.pollLast();
            maxDq.offerLast(right);
            minDq.offerLast(right);

            while (nums[maxDq.peekFirst()] - nums[minDq.peekFirst()] > 2) {
                left++;
                if (maxDq.peekFirst() < left) maxDq.pollFirst();
                if (minDq.peekFirst() < left) minDq.pollFirst();
            }
            count += right - left + 1;
        }
        return count;
    }

    public static void main(String[] args) {
        System.out.println(continuousSubarrays(new int[]{5,4,2,4}));   // 8
        System.out.println(continuousSubarrays(new int[]{1,2,3}));      // 6
    }
}
```

---

## H16. Count Subarrays Where Max Element Appears at Least K Times

**LeetCode #2962** | **Pattern:** Variable Window — shrink until max appears < K times

```java
public class CountSubarraysMaxK {
    public static long countSubarrays(int[] nums, int k) {
        int maxVal = 0;
        for (int n : nums) maxVal = Math.max(maxVal, n);

        long count = 0;
        int left = 0, maxCount = 0;

        for (int right = 0; right < nums.length; right++) {
            if (nums[right] == maxVal) maxCount++;

            while (maxCount >= k) {
                count += nums.length - right; // all extensions are valid
                if (nums[left++] == maxVal) maxCount--;
            }
        }
        return count;
    }

    public static void main(String[] args) {
        System.out.println(countSubarrays(new int[]{1,3,2,3,3}, 2)); // 6
        System.out.println(countSubarrays(new int[]{1,4,2,1}, 3));   // 0
    }
}
```

---

## H17. Count Subarrays With Score Less Than K

**LeetCode #2302** | **Pattern:** Variable Window — score = sum × length

```java
public class CountSubarraysScoreLessK {
    public static long countSubarrays(int[] nums, long k) {
        long count = 0, sum = 0;
        int left = 0;

        for (int right = 0; right < nums.length; right++) {
            sum += nums[right];
            // Shrink while score >= k
            while (sum * (right - left + 1) >= k) {
                sum -= nums[left++];
            }
            count += right - left + 1; // all subarrays ending at right
        }
        return count;
    }

    public static void main(String[] args) {
        System.out.println(countSubarrays(new int[]{2,1,4,3,5}, 10)); // 6
        System.out.println(countSubarrays(new int[]{1,1,1}, 5));       // 5
    }
}
```

---

## H18. Count Complete Subarrays (Hard variant)

**LeetCode #2799 Hard** — Extended version with binary search approach:

```java
import java.util.*;

public class CountCompleteSubarraysHard {
    public static int countCompleteSubarrays(int[] nums) {
        int n = nums.length;
        Set<Integer> allDistinct = new HashSet<>();
        for (int x : nums) allDistinct.add(x);
        int k = allDistinct.size();

        int count = 0;
        Map<Integer, Integer> window = new HashMap<>();
        int left = 0;

        for (int right = 0; right < n; right++) {
            window.merge(nums[right], 1, Integer::sum);
            while (window.size() == k) {
                count += n - right;
                int lv = nums[left++];
                window.put(lv, window.get(lv) - 1);
                if (window.get(lv) == 0) window.remove(lv);
            }
        }
        return count;
    }

    public static void main(String[] args) {
        System.out.println(countCompleteSubarrays(new int[]{1,3,1,2,2})); // 4
        System.out.println(countCompleteSubarrays(new int[]{5,5,5,5}));   // 10
    }
}
```

---

## H19. Number of Valid Subarrays

**LeetCode #1063** | **Pattern:** Monotonic Stack (adjacent valid check)

```java
import java.util.*;

public class NumberOfValidSubarrays {
    // Count subarrays where leftmost element is NOT greater than any other in subarray
    public static int validSubarrays(int[] nums) {
        int count = 0;
        Deque<Integer> stack = new ArrayDeque<>(); // monotonic increasing stack

        for (int i = 0; i < nums.length; i++) {
            // Pop elements that are greater than current — they can't extend validly
            while (!stack.isEmpty() && nums[stack.peek()] > nums[i])
                stack.pop();
            stack.push(i);
            // All subarrays ending at i with starts in stack are valid
            count += stack.size();
        }
        return count;
    }

    public static void main(String[] args) {
        System.out.println(validSubarrays(new int[]{1,1,2,2,3})); // 14 (not LeetCode, illustrative)
        System.out.println(validSubarrays(new int[]{3,2,1}));      // 3
    }
}
```

---

## H20. Minimum Absolute Difference Between Elements With Constraint

**LeetCode #2817** | **Pattern:** Sliding Window + SortedSet

```java
import java.util.*;

public class MinAbsDiffConstraint {
    public static int minAbsoluteDifference(List<Integer> nums, int x) {
        TreeMap<Integer, Integer> window = new TreeMap<>();
        int minDiff = Integer.MAX_VALUE;

        for (int i = 0; i < nums.size(); i++) {
            if (i >= x) {
                // Query for closest value to nums[i] in window
                int val = nums.get(i);
                Integer lo = window.floorKey(val);
                Integer hi = window.ceilingKey(val);
                if (lo != null) minDiff = Math.min(minDiff, val - lo);
                if (hi != null) minDiff = Math.min(minDiff, hi - val);
                // Add nums[i-x] to window (it's now x away from i)
                window.merge(nums.get(i - x), 1, Integer::sum);
            }
        }
        return minDiff == Integer.MAX_VALUE ? 0 : minDiff;
    }

    public static void main(String[] args) {
        System.out.println(minAbsoluteDifference(Arrays.asList(4,3,2,4), 2)); // 0
        System.out.println(minAbsoluteDifference(Arrays.asList(5,3,2,10,15), 1)); // 1
    }
}
```

---
---

# PART 4 — STRING SLIDING WINDOW PROBLEMS (1–10)

---

## S1. Smallest Window Containing All Characters

**Pattern:** Variable Window + HashMap — classic minimum window

```java
import java.util.*;

public class SmallestWindowAllChars {
    public static String smallestWindow(String s, String t) {
        if (s.isEmpty() || t.isEmpty()) return "";
        Map<Character, Integer> need = new HashMap<>();
        for (char c : t.toCharArray()) need.merge(c, 1, Integer::sum);

        int left = 0, formed = 0, required = need.size();
        Map<Character, Integer> window = new HashMap<>();
        String result = "";
        int minLen = Integer.MAX_VALUE;

        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            window.merge(c, 1, Integer::sum);
            if (need.containsKey(c) && window.get(c).equals(need.get(c))) formed++;

            while (formed == required) {
                if (right - left + 1 < minLen) {
                    minLen = right - left + 1;
                    result = s.substring(left, right + 1);
                }
                char lc = s.charAt(left++);
                window.put(lc, window.get(lc) - 1);
                if (need.containsKey(lc) && window.get(lc) < need.get(lc)) formed--;
            }
        }
        return result;
    }

    public static void main(String[] args) {
        System.out.println(smallestWindow("timetopractice", "toc")); // "toprac"
        System.out.println(smallestWindow("zoomlazapzo", "oza"));    // "apzo"
    }
}
```

---

## S2. Longest Palindromic Substring

**LeetCode #5** | **Pattern:** Expand Around Center (not classic sliding window, but window concept)

```java
public class LongestPalindromicSubstring {
    public static String longestPalindrome(String s) {
        int start = 0, maxLen = 1;
        for (int i = 0; i < s.length(); i++) {
            // Odd length
            int len1 = expand(s, i, i);
            // Even length
            int len2 = expand(s, i, i + 1);
            int len  = Math.max(len1, len2);
            if (len > maxLen) {
                maxLen = len;
                start  = i - (len - 1) / 2;
            }
        }
        return s.substring(start, start + maxLen);
    }

    private static int expand(String s, int left, int right) {
        while (left >= 0 && right < s.length() && s.charAt(left) == s.charAt(right)) {
            left--; right++;
        }
        return right - left - 1;
    }

    public static void main(String[] args) {
        System.out.println(longestPalindrome("babad"));  // "bab" or "aba"
        System.out.println(longestPalindrome("cbbd"));   // "bb"
        System.out.println(longestPalindrome("racecar")); // "racecar"
    }
}
```

---

## S3. Longest Substring After Replacement (Revisited)

**LeetCode #424** — Extended to include lowercase + uppercase:

```java
public class LongestSubstringAfterReplacement {
    public static int characterReplacement(String s, int k) {
        int[] freq = new int[26];
        int left = 0, maxFreq = 0, maxLen = 0;

        for (int right = 0; right < s.length(); right++) {
            freq[s.charAt(right) - 'A']++;
            maxFreq = Math.max(maxFreq, freq[s.charAt(right) - 'A']);

            // (window size) - (most frequent char count) = chars to replace
            if ((right - left + 1) - maxFreq > k) {
                freq[s.charAt(left++) - 'A']--;
            }
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }

    public static void main(String[] args) {
        System.out.println(characterReplacement("AABABBA", 1)); // 4
        System.out.println(characterReplacement("ABAB", 2));    // 4
    }
}
```

---

## S4. Longest Valid Parentheses

**LeetCode #32** | **Pattern:** DP or Stack — find longest valid () sequence

```java
import java.util.*;

public class LongestValidParentheses {
    public static int longestValidParentheses(String s) {
        int maxLen = 0;
        Deque<Integer> stack = new ArrayDeque<>();
        stack.push(-1); // base index

        for (int i = 0; i < s.length(); i++) {
            if (s.charAt(i) == '(') {
                stack.push(i);
            } else {
                stack.pop();
                if (stack.isEmpty()) {
                    stack.push(i); // new base
                } else {
                    maxLen = Math.max(maxLen, i - stack.peek());
                }
            }
        }
        return maxLen;
    }

    // Sliding window / two-pass approach
    public static int longestValidParenthesesSW(String s) {
        int left = 0, right = 0, maxLen = 0;

        // Left to right pass
        for (char c : s.toCharArray()) {
            if (c == '(') left++; else right++;
            if (left == right) maxLen = Math.max(maxLen, 2 * right);
            else if (right > left) left = right = 0;
        }

        left = right = 0;
        // Right to left pass
        for (int i = s.length() - 1; i >= 0; i--) {
            if (s.charAt(i) == '(') left++; else right++;
            if (left == right) maxLen = Math.max(maxLen, 2 * left);
            else if (left > right) left = right = 0;
        }
        return maxLen;
    }

    public static void main(String[] args) {
        System.out.println(longestValidParentheses("(()")); // 2
        System.out.println(longestValidParentheses(")()())")); // 4
        System.out.println(longestValidParentheses("")); // 0
    }
}
```

---

## S5. Minimum Additions to Make String Valid

**LeetCode #921** | **Pattern:** Balance counter

```java
public class MinAddMakeStringValid {
    public static int minAddToMakeValid(String s) {
        int open = 0, close = 0;
        for (char c : s.toCharArray()) {
            if (c == '(') {
                open++;
            } else {
                if (open > 0) open--; // match with unmatched open
                else close++;         // unmatched close
            }
        }
        return open + close; // unmatched opens + unmatched closes
    }

    public static void main(String[] args) {
        System.out.println(minAddToMakeValid("())")); // 1
        System.out.println(minAddToMakeValid("(((")); // 3
        System.out.println(minAddToMakeValid("(()))")); // 1
    }
}
```

---

## S6. Longest Common Substring

**Pattern:** DP — not sliding window, but conceptually related

```java
public class LongestCommonSubstring {
    public static int longestCommon(String s1, String s2) {
        int n1 = s1.length(), n2 = s2.length(), maxLen = 0;
        int[][] dp = new int[n1 + 1][n2 + 1];

        for (int i = 1; i <= n1; i++) {
            for (int j = 1; j <= n2; j++) {
                if (s1.charAt(i-1) == s2.charAt(j-1)) {
                    dp[i][j] = dp[i-1][j-1] + 1;
                    maxLen = Math.max(maxLen, dp[i][j]);
                }
            }
        }
        return maxLen;
    }

    // Sliding window / rolling hash approach for O(n log n)
    public static String longestCommonSubstringStr(String s1, String s2) {
        int n1 = s1.length(), n2 = s2.length(), maxLen = 0, startIdx = 0;
        int[][] dp = new int[n1 + 1][n2 + 1];
        for (int i = 1; i <= n1; i++) {
            for (int j = 1; j <= n2; j++) {
                if (s1.charAt(i-1) == s2.charAt(j-1)) {
                    dp[i][j] = dp[i-1][j-1] + 1;
                    if (dp[i][j] > maxLen) { maxLen = dp[i][j]; startIdx = i - maxLen; }
                }
            }
        }
        return s1.substring(startIdx, startIdx + maxLen);
    }

    public static void main(String[] args) {
        System.out.println(longestCommon("abcde", "abfce"));         // 2 ("ab")
        System.out.println(longestCommonSubstringStr("GeeksforGeeks", "GeeksQuiz")); // "Geeks"
    }
}
```

---

## S7. Distinct Subsequences

**LeetCode #115** | **Pattern:** DP counting

```java
public class DistinctSubsequences {
    public static int numDistinct(String s, String t) {
        int m = s.length(), n = t.length();
        int[][] dp = new int[n + 1][m + 1];

        // Empty t matches any prefix of s
        for (int j = 0; j <= m; j++) dp[0][j] = 1;

        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= m; j++) {
                dp[i][j] = dp[i][j-1]; // skip s[j-1]
                if (t.charAt(i-1) == s.charAt(j-1))
                    dp[i][j] += dp[i-1][j-1]; // use s[j-1] to match t[i-1]
            }
        }
        return dp[n][m];
    }

    public static void main(String[] args) {
        System.out.println(numDistinct("rabbbit", "rabbit")); // 3
        System.out.println(numDistinct("babgbag", "bag"));    // 5
    }
}
```

---

## S8. Longest Repeating Subsequence

**Pattern:** LCS of string with itself (no same-index matches)

```java
public class LongestRepeatingSubsequence {
    public static int longestRepeatingSubseq(String s) {
        int n = s.length();
        int[][] dp = new int[n + 1][n + 1];

        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= n; j++) {
                if (i != j && s.charAt(i-1) == s.charAt(j-1)) {
                    dp[i][j] = 1 + dp[i-1][j-1];
                } else {
                    dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
                }
            }
        }
        return dp[n][n];
    }

    public static void main(String[] args) {
        System.out.println(longestRepeatingSubseq("aab"));    // 1
        System.out.println(longestRepeatingSubseq("aabb"));   // 2
        System.out.println(longestRepeatingSubseq("aabebcdd")); // 3
    }
}
```

---

## S9. Longest Prefix with Equal Frequency

**Pattern:** Variable Window — balanced characters

```java
import java.util.*;

public class LongestPrefixEqualFreq {
    // Find longest prefix where all present chars have equal frequency
    public static int longestEqualFreqPrefix(String s) {
        Map<Integer, Integer> freqCount = new HashMap<>(); // freq → count of chars with that freq
        Map<Character, Integer> charFreq = new HashMap<>();
        int result = 0, distinctChars = 0;

        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            int oldFreq = charFreq.getOrDefault(c, 0);
            if (oldFreq == 0) distinctChars++;

            // Update freqCount
            if (oldFreq > 0) {
                freqCount.put(oldFreq, freqCount.get(oldFreq) - 1);
                if (freqCount.get(oldFreq) == 0) freqCount.remove(oldFreq);
            }
            int newFreq = oldFreq + 1;
            charFreq.put(c, newFreq);
            freqCount.merge(newFreq, 1, Integer::sum);

            // Check if prefix is valid (equal frequency)
            int prefixLen = i + 1;
            boolean valid = false;
            if (freqCount.size() == 1) {
                int freq = freqCount.keySet().iterator().next();
                // All chars have same freq
                if (freq == 1 || freqCount.get(freq) * freq == prefixLen)
                    valid = true;
                // Or one char has freq+1 and the rest have freq — if that one extra can be removed
                if (distinctChars * freq == prefixLen) valid = true;
            }
            if (freqCount.size() == 2) {
                var keys = freqCount.keySet().iterator();
                int f1 = keys.next(), f2 = keys.next();
                int min = Math.min(f1, f2), max = Math.max(f1, f2);
                // One char has one extra
                if (max - min == 1 && freqCount.get(max) == 1 &&
                    freqCount.get(min) * min + max == prefixLen) valid = true;
                // One char appears once and there's only one such char
                if (min == 1 && freqCount.get(min) == 1 &&
                    freqCount.get(max) * max + 1 == prefixLen) valid = true;
            }
            if (valid) result = prefixLen;
        }
        return result;
    }

    public static void main(String[] args) {
        System.out.println(longestEqualFreqPrefix("aabbc")); // 4 ("aabb")
        System.out.println(longestEqualFreqPrefix("aabc"));  // 3 ("aab" — no, "aab" has a:2,b:1 → not equal)
    }
}
```

---

## S10. Longest Duplicate Substring

**LeetCode #1044** | **Pattern:** Binary Search + Rolling Hash

```java
import java.util.*;

public class LongestDuplicateSubstring {
    private long[] pow;
    private long[] hash;
    private final long MOD = 1_000_000_007L;
    private final long BASE = 31L;

    public String longestDupSubstring(String s) {
        int n = s.length();
        pow  = new long[n + 1];
        hash = new long[n + 1];
        pow[0] = 1;

        for (int i = 0; i < n; i++) {
            pow[i+1]  = pow[i] * BASE % MOD;
            hash[i+1] = (hash[i] * BASE + (s.charAt(i) - 'a' + 1)) % MOD;
        }

        int lo = 1, hi = n - 1;
        String result = "";
        while (lo <= hi) {
            int mid = (lo + hi) / 2;
            String dup = findDuplicate(s, mid);
            if (dup != null) { result = dup; lo = mid + 1; }
            else               hi = mid - 1;
        }
        return result;
    }

    private String findDuplicate(String s, int len) {
        Set<Long> seen = new HashSet<>();
        for (int i = len; i <= s.length(); i++) {
            long h = (hash[i] - hash[i-len] * pow[len] % MOD + MOD * MOD) % MOD;
            if (!seen.add(h)) return s.substring(i - len, i);
        }
        return null;
    }

    public static void main(String[] args) {
        LongestDuplicateSubstring sol = new LongestDuplicateSubstring();
        System.out.println(sol.longestDupSubstring("banana"));   // "ana"
        System.out.println(sol.longestDupSubstring("abcd"));     // ""
    }
}
```

---

# PART 5 — ARRAY SLIDING WINDOW PROBLEMS (1–10)

---

## A1. Trapping Rain Water

**LeetCode #42** | **Pattern:** Two Pointer (sliding window variant)

```java
public class TrappingRainWater {
    public static int trap(int[] height) {
        int left = 0, right = height.length - 1;
        int leftMax = 0, rightMax = 0, water = 0;

        while (left < right) {
            if (height[left] < height[right]) {
                if (height[left] >= leftMax) leftMax = height[left];
                else water += leftMax - height[left];
                left++;
            } else {
                if (height[right] >= rightMax) rightMax = height[right];
                else water += rightMax - height[right];
                right--;
            }
        }
        return water;
    }

    public static void main(String[] args) {
        System.out.println(trap(new int[]{0,1,0,2,1,0,1,3,2,1,2,1})); // 6
        System.out.println(trap(new int[]{4,2,0,3,2,5}));              // 9
    }
}
```

---

## A2. Container With Most Water

**LeetCode #11** | **Pattern:** Two Pointer — maximize area

```java
public class ContainerWithMostWater {
    public static int maxArea(int[] height) {
        int left = 0, right = height.length - 1, maxWater = 0;

        while (left < right) {
            int water = Math.min(height[left], height[right]) * (right - left);
            maxWater = Math.max(maxWater, water);
            if (height[left] < height[right]) left++;
            else                               right--;
        }
        return maxWater;
    }

    public static void main(String[] args) {
        System.out.println(maxArea(new int[]{1,8,6,2,5,4,8,3,7})); // 49
        System.out.println(maxArea(new int[]{1,1}));                 // 1
    }
}
```

---

## A3. Minimum Window in Circular Array

**Pattern:** Circular array — double array trick + sliding window

```java
import java.util.*;

public class MinWindowCircularArray {
    // Find min-length subarray in circular array with sum >= target
    public static int minSumCircular(int[] arr, int target) {
        int n = arr.length;
        // Double the array to handle circular wrapping
        int[] doubled = new int[2 * n];
        for (int i = 0; i < 2 * n; i++) doubled[i] = arr[i % n];

        int left = 0, sum = 0, minLen = Integer.MAX_VALUE;
        for (int right = 0; right < 2 * n; right++) {
            sum += doubled[right];
            while (sum >= target && right - left + 1 <= n) {
                minLen = Math.min(minLen, right - left + 1);
                sum -= doubled[left++];
            }
        }
        return minLen == Integer.MAX_VALUE ? -1 : minLen;
    }

    public static void main(String[] args) {
        System.out.println(minSumCircular(new int[]{5,1,3,2}, 7)); // 2 (5+3 but circular: 3+2+? no; 5+3=8→len 2 non-circ)
    }
}
```

---

## A4. Maximum Points You Can Obtain from Cards

**LeetCode #1423** | **Pattern:** Fixed Window — take from two ends

**Key Insight:** Taking k cards from ends = array total minus minimum subarray of size (n-k).

```java
public class MaxPointsFromCards {
    public static int maxScore(int[] cardPoints, int k) {
        int n = cardPoints.length;
        int total = 0;
        for (int c : cardPoints) total += c;

        // Find minimum sum window of size n-k (the cards we DON'T take)
        int windowSize = n - k;
        if (windowSize == 0) return total;

        int windowSum = 0;
        for (int i = 0; i < windowSize; i++) windowSum += cardPoints[i];
        int minWindow = windowSum;

        for (int i = windowSize; i < n; i++) {
            windowSum += cardPoints[i] - cardPoints[i - windowSize];
            minWindow = Math.min(minWindow, windowSum);
        }
        return total - minWindow;
    }

    public static void main(String[] args) {
        System.out.println(maxScore(new int[]{1,2,3,4,5,6,1}, 3));        // 12
        System.out.println(maxScore(new int[]{2,2,2}, 2));                  // 4
        System.out.println(maxScore(new int[]{9,7,7,9,7,7,9}, 7));         // 55
    }
}
```

---

## A5. Find the Power of K-Size Subarrays

**LeetCode #3254** | **Pattern:** Fixed Window — check if strictly increasing AND max is last element

```java
public class FindPowerKSizeSubarrays {
    public static int[] resultsArray(int[] nums, int k) {
        int n = nums.length;
        int[] result = new int[n - k + 1];

        for (int i = 0; i <= n - k; i++) {
            boolean valid = true;
            for (int j = i + 1; j < i + k; j++) {
                if (nums[j] != nums[j-1] + 1) { valid = false; break; }
            }
            result[i] = valid ? nums[i + k - 1] : -1;
        }
        return result;
    }

    // O(n) optimised with consecutive count
    public static int[] resultsArrayOptimal(int[] nums, int k) {
        int n = nums.length;
        int[] result = new int[n - k + 1];
        int consecutive = 1;

        for (int i = 1; i < n; i++) {
            consecutive = (nums[i] == nums[i-1] + 1) ? consecutive + 1 : 1;
            if (i >= k - 1) result[i - k + 1] = consecutive >= k ? nums[i] : -1;
        }
        return result;
    }

    public static void main(String[] args) {
        System.out.println(java.util.Arrays.toString(
            resultsArray(new int[]{1,2,3,4,3,2,5}, 3)));
        // [3,4,-1,-1,-1]
    }
}
```

---

## A6. Max Sum of Distinct Subarrays Length K

**LeetCode #2461** | **Pattern:** Fixed Window + HashMap for uniqueness

```java
import java.util.*;

public class MaxSumDistinctSubarrays {
    public static long maximumSubarraySum(int[] nums, int k) {
        Map<Integer, Integer> freq = new HashMap<>();
        long sum = 0, maxSum = 0;
        int left = 0;

        for (int right = 0; right < nums.length; right++) {
            freq.merge(nums[right], 1, Integer::sum);
            sum += nums[right];

            if (right - left + 1 == k) {
                if (freq.size() == k) maxSum = Math.max(maxSum, sum);
                int lv = nums[left++];
                sum -= lv;
                freq.put(lv, freq.get(lv) - 1);
                if (freq.get(lv) == 0) freq.remove(lv);
            }
        }
        return maxSum;
    }

    public static void main(String[] args) {
        System.out.println(maximumSubarraySum(new int[]{1,5,4,2,9,9,9}, 3)); // 15
        System.out.println(maximumSubarraySum(new int[]{4,4,4}, 3));          // 0
    }
}
```

---

## A7. Maximum Robots Within Budget

**LeetCode #2398** | **Pattern:** Fixed Window with monotonic deque for max

```java
import java.util.*;

public class MaxRobotsWithinBudget {
    public static int maximumRobots(int[] chargeTimes, int[] runningCosts, long budget) {
        Deque<Integer> maxDq = new ArrayDeque<>(); // for max chargeTime
        long runSum = 0;
        int left = 0, maxRobots = 0;

        for (int right = 0; right < chargeTimes.length; right++) {
            runSum += runningCosts[right];
            while (!maxDq.isEmpty() && chargeTimes[maxDq.peekLast()] <= chargeTimes[right])
                maxDq.pollLast();
            maxDq.offerLast(right);

            int k = right - left + 1;
            long cost = chargeTimes[maxDq.peekFirst()] + (long) k * runSum;

            if (cost <= budget) {
                maxRobots = Math.max(maxRobots, k);
            } else {
                runSum -= runningCosts[left];
                if (maxDq.peekFirst() == left) maxDq.pollFirst();
                left++;
            }
        }
        return maxRobots;
    }

    public static void main(String[] args) {
        System.out.println(maximumRobots(new int[]{3,6,1,3,4},
                                         new int[]{2,1,3,4,5}, 25)); // 3
        System.out.println(maximumRobots(new int[]{11,12,19},
                                         new int[]{10,8,7}, 19));    // 0
    }
}
```

---

## A8. Count Alternating Subarrays

**LeetCode #3101** | **Pattern:** Variable Window — count subarrays with alternating parity

```java
public class CountAlternatingSubarrays {
    public static long countAlternatingSubarrays(int[] nums) {
        long count = 1, run = 1;
        for (int i = 1; i < nums.length; i++) {
            if (nums[i] != nums[i-1]) run++;
            else run = 1;
            count += run;
        }
        return count;
    }

    public static void main(String[] args) {
        System.out.println(countAlternatingSubarrays(new int[]{0,1,1,1})); // 5
        System.out.println(countAlternatingSubarrays(new int[]{1,0,1,0})); // 10
    }
}
```

---

## A9. Longest Arithmetic Subarray

**Pattern:** Variable Window — track arithmetic progression

```java
public class LongestArithmeticSubarray {
    public static int longestArithSeqLength(int[] nums) {
        if (nums.length <= 1) return nums.length;
        // Track longest subarray with same difference
        int maxLen = 2;
        int run = 2;
        int prevDiff = nums[1] - nums[0];

        for (int i = 2; i < nums.length; i++) {
            int diff = nums[i] - nums[i-1];
            if (diff == prevDiff) run++;
            else { run = 2; prevDiff = diff; }
            maxLen = Math.max(maxLen, run);
        }
        return maxLen;
    }

    public static void main(String[] args) {
        System.out.println(longestArithSeqLength(new int[]{3,5,7,9,11})); // 5
        System.out.println(longestArithSeqLength(new int[]{9,4,0,-4,-8,-12})); // 6
        System.out.println(longestArithSeqLength(new int[]{1,2,3,4}));    // 4
    }
}
```

---

## A10. Count Strictly Increasing Subarrays

**LeetCode #2393** | **Pattern:** Variable Window — run tracking

```java
public class CountStrictlyIncreasingSubarrays {
    public static long countSubarrays(int[] nums) {
        long count = 0, run = 1;
        for (int i = 1; i < nums.length; i++) {
            if (nums[i] > nums[i-1]) run++;
            else run = 1;
            count += run; // each new element extends 'run' subarrays
        }
        return count + 1; // +1 for the first single element
    }

    public static void main(String[] args) {
        System.out.println(countSubarrays(new int[]{1,3,5,4,4,6})); // 10
        System.out.println(countSubarrays(new int[]{1,2,3,4,5}));    // 15
    }
}
```

---
---

# PART 6 — ADVANCED INTERVIEW PROBLEMS (1–10)

> These simulate real-world engineering scenarios where sliding window is applied to streaming data, system design, and production code.

---

## ADV1. Median in Sliding Window (System Design)

**Pattern:** Two Heaps with lazy deletion — production-quality implementation

```java
import java.util.*;

public class MedianInSlidingWindow {
    // Max-heap for lower half, min-heap for upper half
    private PriorityQueue<Integer> small = new PriorityQueue<>(Collections.reverseOrder());
    private PriorityQueue<Integer> large = new PriorityQueue<>();
    private Map<Integer, Integer> toRemove = new HashMap<>(); // lazy deletion
    private int smallSize = 0, largeSize = 0;

    public double[] medianSlidingWindow(int[] nums, int k) {
        // Build initial window
        for (int i = 0; i < k; i++) add(nums[i]);
        double[] result = new double[nums.length - k + 1];
        result[0] = getMedian(k);

        for (int i = k; i < nums.length; i++) {
            add(nums[i]);
            remove(nums[i - k]);
            rebalance();
            result[i - k + 1] = getMedian(k);
        }
        return result;
    }

    private void add(int num) {
        if (small.isEmpty() || num <= small.peek()) { small.offer(num); smallSize++; }
        else { large.offer(num); largeSize++; }
        rebalance();
    }

    private void remove(int num) {
        toRemove.merge(num, 1, Integer::sum);
        if (!small.isEmpty() && num <= small.peek()) smallSize--;
        else largeSize--;
        // Lazy: don't actually remove yet, prune when at top
    }

    private void rebalance() {
        // Prune tops
        while (!small.isEmpty() && toRemove.containsKey(small.peek())) {
            toRemove.merge(small.poll(), -1, (a,b) -> a+b == 0 ? null : a+b);
        }
        while (!large.isEmpty() && toRemove.containsKey(large.peek())) {
            toRemove.merge(large.poll(), -1, (a,b) -> a+b == 0 ? null : a+b);
        }
        // Balance sizes: smallSize == largeSize or smallSize == largeSize+1
        if (smallSize > largeSize + 1) {
            large.offer(small.poll()); smallSize--; largeSize++;
        } else if (largeSize > smallSize) {
            small.offer(large.poll()); largeSize--; smallSize++;
        }
        // Prune again after transfer
        while (!small.isEmpty() && toRemove.containsKey(small.peek()))
            toRemove.merge(small.poll(), -1, (a,b)->a+b==0?null:a+b);
        while (!large.isEmpty() && toRemove.containsKey(large.peek()))
            toRemove.merge(large.poll(), -1, (a,b)->a+b==0?null:a+b);
    }

    private double getMedian(int k) {
        if (k % 2 == 1) return small.peek();
        return ((double) small.peek() + large.peek()) / 2.0;
    }

    public static void main(String[] args) {
        MedianInSlidingWindow mw = new MedianInSlidingWindow();
        System.out.println(Arrays.toString(
            mw.medianSlidingWindow(new int[]{1,3,-1,-3,5,3,6,7}, 3)));
        // [1.0,-1.0,-1.0,3.0,5.0,6.0]
    }
}
```

---

## ADV2. Dynamic Sliding Window Maximum (Real-time Processing)

**Pattern:** Deque-based with callbacks and stream processing

```java
import java.util.*;
import java.util.function.Consumer;

public class DynamicSlidingWindowMax {
    private final int windowSize;
    private final Deque<long[]> dq; // [value, timestamp]
    private final Consumer<Long> onNewMax;

    public DynamicSlidingWindowMax(int windowSize, Consumer<Long> onNewMax) {
        this.windowSize = windowSize;
        this.dq = new ArrayDeque<>();
        this.onNewMax = onNewMax;
    }

    /**
     * Process new data point with a timestamp.
     * Automatically evicts stale entries and notifies on new max.
     */
    public void addValue(long value, long timestamp) {
        // Evict entries outside the window
        while (!dq.isEmpty() && dq.peekFirst()[1] < timestamp - windowSize + 1)
            dq.pollFirst();

        // Maintain decreasing order
        while (!dq.isEmpty() && dq.peekLast()[0] <= value)
            dq.pollLast();

        dq.offerLast(new long[]{value, timestamp});

        // Notify subscriber of current max
        if (onNewMax != null) onNewMax.accept(dq.peekFirst()[0]);
    }

    public long getCurrentMax() {
        return dq.isEmpty() ? Long.MIN_VALUE : dq.peekFirst()[0];
    }

    public static void main(String[] args) {
        System.out.println("=== Dynamic Sliding Window Max (window=3) ===");
        DynamicSlidingWindowMax dsw = new DynamicSlidingWindowMax(3,
            max -> System.out.println("  New max: " + max));

        long[][] data = {{10,1},{20,2},{30,3},{15,4},{5,5},{25,6},{8,7}};
        for (long[] d : data) {
            System.out.printf("Add value=%d at t=%d → ", d[0], d[1]);
            dsw.addValue(d[0], d[1]);
        }
    }
}
```

---

## ADV3. Stream-Based Moving Average

**LeetCode #346** | **Pattern:** Fixed circular buffer — O(1) per element

```java
import java.util.*;

public class MovingAverage {
    private final int size;
    private final double[] window; // circular buffer
    private int head = 0, count = 0;
    private double sum = 0;

    public MovingAverage(int size) {
        this.size   = size;
        this.window = new double[size];
    }

    public double next(double val) {
        if (count == size) sum -= window[head]; // drop oldest
        window[head] = val;
        sum += val;
        head = (head + 1) % size;
        count = Math.min(count + 1, size);
        return sum / count;
    }

    // Convenience: process entire stream
    public static double[] processStream(double[] stream, int windowSize) {
        MovingAverage ma = new MovingAverage(windowSize);
        double[] result = new double[stream.length];
        for (int i = 0; i < stream.length; i++)
            result[i] = ma.next(stream[i]);
        return result;
    }

    public static void main(String[] args) {
        MovingAverage ma = new MovingAverage(3);
        double[] values = {1, 10, 3, 5};
        for (double v : values)
            System.out.printf("next(%.0f) = %.4f%n", v, ma.next(v));
        // 1.0, 5.5, 4.667, 6.0

        System.out.println("\n=== Stream processing ===");
        double[] result = processStream(new double[]{2,8,4,6,10,1,5}, 3);
        System.out.println(Arrays.toString(result));
    }
}
```

---

## ADV4. Sliding Window Rate Limiter

**Pattern:** Fixed time window + rolling count for API rate limiting

```java
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class SlidingWindowRateLimiter {
    private final int maxRequests;      // max requests per window
    private final long windowMs;        // window duration in ms
    private final Deque<Long> timestamps; // request timestamp log

    public SlidingWindowRateLimiter(int maxRequests, long windowMs) {
        this.maxRequests = maxRequests;
        this.windowMs    = windowMs;
        this.timestamps  = new ArrayDeque<>();
    }

    /**
     * Returns true if request is allowed, false if rate limited.
     * Thread-safe version uses concurrent structures.
     */
    public synchronized boolean isAllowed() {
        long now = System.currentTimeMillis();
        long cutoff = now - windowMs;

        // Evict requests outside the window
        while (!timestamps.isEmpty() && timestamps.peekFirst() <= cutoff)
            timestamps.pollFirst();

        if (timestamps.size() < maxRequests) {
            timestamps.addLast(now);
            return true;
        }
        return false;
    }

    public int getCurrentCount() {
        long now = System.currentTimeMillis();
        long cutoff = now - windowMs;
        return (int) timestamps.stream().filter(t -> t > cutoff).count();
    }

    // Fixed window counter (simpler but has edge-case burst)
    static class FixedWindowRateLimiter {
        private final int limit;
        private final long windowMs;
        private AtomicInteger count = new AtomicInteger(0);
        private volatile long windowStart = System.currentTimeMillis();

        FixedWindowRateLimiter(int limit, long windowMs) {
            this.limit = limit; this.windowMs = windowMs;
        }

        synchronized boolean isAllowed() {
            long now = System.currentTimeMillis();
            if (now - windowStart >= windowMs) {
                windowStart = now; count.set(0);
            }
            return count.incrementAndGet() <= limit;
        }
    }

    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== Sliding Window Rate Limiter (5 req/second) ===");
        SlidingWindowRateLimiter limiter = new SlidingWindowRateLimiter(5, 1000);

        for (int i = 1; i <= 8; i++) {
            boolean allowed = limiter.isAllowed();
            System.out.printf("Request %d: %s (count=%d)%n",
                i, allowed ? "ALLOWED" : "RATE LIMITED", limiter.getCurrentCount());
            Thread.sleep(100);
        }
    }
}
```

---

## ADV5. Real-Time Log Window Processing

**Pattern:** Time-based sliding window for log analysis

```java
import java.util.*;
import java.time.*;

public class LogWindowProcessor {
    record LogEntry(Instant timestamp, String level, String message) {}

    private final long windowSeconds;
    private final Deque<LogEntry> window = new ArrayDeque<>();
    private final Map<String, Integer> levelCounts = new HashMap<>();

    public LogWindowProcessor(long windowSeconds) {
        this.windowSeconds = windowSeconds;
    }

    public void addLog(LogEntry entry) {
        window.addLast(entry);
        levelCounts.merge(entry.level(), 1, Integer::sum);
        evictStale(entry.timestamp());
    }

    private void evictStale(Instant now) {
        Instant cutoff = now.minusSeconds(windowSeconds);
        while (!window.isEmpty() && window.peekFirst().timestamp().isBefore(cutoff)) {
            LogEntry old = window.pollFirst();
            levelCounts.merge(old.level(), -1, (a, b) -> a+b == 0 ? null : a+b);
        }
    }

    public Map<String, Integer> getWindowStats() {
        evictStale(Instant.now());
        return Collections.unmodifiableMap(new HashMap<>(levelCounts));
    }

    public int getErrorRate() {
        evictStale(Instant.now());
        return levelCounts.getOrDefault("ERROR", 0);
    }

    public boolean isAlertThreshold(String level, int threshold) {
        return levelCounts.getOrDefault(level, 0) >= threshold;
    }

    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== Real-Time Log Window (30s window) ===");
        LogWindowProcessor processor = new LogWindowProcessor(30);

        Instant now = Instant.now();
        processor.addLog(new LogEntry(now, "INFO", "Server started"));
        processor.addLog(new LogEntry(now.plusSeconds(5), "ERROR", "DB timeout"));
        processor.addLog(new LogEntry(now.plusSeconds(10), "ERROR", "DB timeout"));
        processor.addLog(new LogEntry(now.plusSeconds(15), "WARN", "High memory"));
        processor.addLog(new LogEntry(now.plusSeconds(20), "ERROR", "Connection refused"));

        System.out.println("Window stats: " + processor.getWindowStats());
        System.out.println("Error count:  " + processor.getErrorRate());
        System.out.println("Alert (3 errors): " + processor.isAlertThreshold("ERROR", 3));
    }
}
```

---

## ADV6. TCP Packet Window Analysis

**Pattern:** Fixed sliding window simulating TCP congestion control

```java
import java.util.*;

public class TCPWindowAnalysis {
    record Packet(int seqNum, int size, boolean acked) {}

    private final int windowSize; // max unacked bytes
    private final Deque<Packet> window = new ArrayDeque<>();
    private int unackedBytes = 0;
    private int nextExpected = 0; // next sequence number to ack
    private long bytesTransferred = 0;

    public TCPWindowAnalysis(int windowSize) {
        this.windowSize = windowSize;
    }

    // Returns true if packet was accepted into window
    public boolean sendPacket(int seqNum, int size) {
        if (unackedBytes + size > windowSize) {
            System.out.printf("  [WINDOW FULL] Seq=%d blocked (unacked=%d, window=%d)%n",
                seqNum, unackedBytes, windowSize);
            return false;
        }
        window.addLast(new Packet(seqNum, size, false));
        unackedBytes += size;
        System.out.printf("  [SEND] Seq=%d size=%d (unacked=%d/%d)%n",
            seqNum, size, unackedBytes, windowSize);
        return true;
    }

    // Acknowledge all packets up to ackNum (cumulative ACK)
    public void acknowledge(int ackNum) {
        while (!window.isEmpty() && window.peekFirst().seqNum() < ackNum) {
            Packet p = window.pollFirst();
            unackedBytes -= p.size();
            bytesTransferred += p.size();
            System.out.printf("  [ACK] Seq=%d (unacked=%d, throughput=%d)%n",
                p.seqNum(), unackedBytes, bytesTransferred);
        }
    }

    public int availableWindow() { return windowSize - unackedBytes; }
    public long getThroughput() { return bytesTransferred; }

    public static void main(String[] args) {
        System.out.println("=== TCP Sliding Window (size=1000 bytes) ===");
        TCPWindowAnalysis tcp = new TCPWindowAnalysis(1000);

        tcp.sendPacket(1, 300);
        tcp.sendPacket(2, 400);
        tcp.sendPacket(3, 400); // blocked
        tcp.acknowledge(3);     // ack seqs 1,2 → frees 700 bytes
        tcp.sendPacket(3, 400); // now fits
        tcp.sendPacket(4, 200);
        tcp.acknowledge(5);     // ack all
        System.out.println("Total bytes: " + tcp.getThroughput());
    }
}
```

---

## ADV7. Time-Based Key-Value Store

**LeetCode #981** | **Pattern:** Map of sorted timestamps → sliding window query

```java
import java.util.*;

public class TimeBasedKeyValueStore {
    // key → TreeMap<timestamp, value>
    private final Map<String, TreeMap<Integer, String>> store = new HashMap<>();

    public void set(String key, String value, int timestamp) {
        store.computeIfAbsent(key, k -> new TreeMap<>()).put(timestamp, value);
    }

    // Return value at largest timestamp <= given timestamp
    public String get(String key, int timestamp) {
        if (!store.containsKey(key)) return "";
        TreeMap<Integer, String> times = store.get(key);
        Integer floor = times.floorKey(timestamp);
        return floor == null ? "" : times.get(floor);
    }

    // Sliding window: get all values within [t-window, t]
    public List<String> getWindow(String key, int timestamp, int windowSecs) {
        if (!store.containsKey(key)) return List.of();
        TreeMap<Integer, String> times = store.get(key);
        // subMap returns view from (timestamp-windowSecs) to timestamp inclusive
        return new ArrayList<>(
            times.subMap(timestamp - windowSecs, true, timestamp, true).values()
        );
    }

    public static void main(String[] args) {
        System.out.println("=== Time-Based Key-Value Store ===");
        TimeBasedKeyValueStore store = new TimeBasedKeyValueStore();

        store.set("foo", "bar",   1);
        store.set("foo", "bar2",  4);
        store.set("price", "100", 1);
        store.set("price", "150", 3);
        store.set("price", "200", 7);

        System.out.println(store.get("foo", 1));     // "bar"
        System.out.println(store.get("foo", 3));     // "bar" (largest <= 3 is t=1)
        System.out.println(store.get("foo", 4));     // "bar2"
        System.out.println(store.get("foo", 5));     // "bar2"

        System.out.println("Window [2,5]: " + store.getWindow("price", 5, 3));
        // Values from t=2 to t=5: [150]
    }
}
```

---

## ADV8. Event Stream Aggregation

**Pattern:** Tumbling + Sliding windows on event streams

```java
import java.util.*;
import java.time.*;

public class EventStreamAggregation {
    record Event(String type, double value, Instant time) {}

    // Sliding window aggregator
    static class WindowAggregator {
        private final long windowMs;
        private final Deque<Event> events = new ArrayDeque<>();
        private double sum = 0;
        private double max = Double.MIN_VALUE;
        private int count = 0;

        WindowAggregator(long windowMs) { this.windowMs = windowMs; }

        void add(Event e) {
            evict(e.time());
            events.addLast(e);
            sum += e.value();
            max = Math.max(max, e.value());
            count++;
        }

        private void evict(Instant now) {
            Instant cutoff = now.minusMillis(windowMs);
            while (!events.isEmpty() && events.peekFirst().time().isBefore(cutoff)) {
                Event old = events.pollFirst();
                sum -= old.value();
                count--;
            }
            // Recompute max if needed (expensive but correct)
            if (count > 0) {
                max = events.stream().mapToDouble(Event::value).max().orElse(Double.MIN_VALUE);
            } else {
                max = Double.MIN_VALUE;
            }
        }

        double getAvg()   { return count == 0 ? 0 : sum / count; }
        double getMax()   { return max; }
        double getSum()   { return sum; }
        int    getCount() { return count; }

        void printStats(String label) {
            System.out.printf("[%s] count=%d sum=%.1f avg=%.2f max=%.1f%n",
                label, count, sum, getAvg(), getMax());
        }
    }

    public static void main(String[] args) {
        System.out.println("=== Event Stream Aggregation (5s window) ===");
        WindowAggregator agg = new WindowAggregator(5000);

        Instant base = Instant.now();
        double[] values = {10, 20, 30, 15, 25, 40, 5, 35};
        for (int i = 0; i < values.length; i++) {
            Event e = new Event("METRIC", values[i], base.plusSeconds(i));
            agg.add(e);
            agg.printStats("t=" + i);
        }
    }
}
```

---

## ADV9. Live Stock Moving Average System

**Pattern:** Production-grade moving average with multiple windows

```java
import java.util.*;

public class LiveStockMovingAverage {
    static class MultiWindowMA {
        private final int[] windowSizes;
        private final double[][] buffers;   // circular buffers
        private final int[] heads;
        private final int[] counts;
        private final double[] sums;

        MultiWindowMA(int... windowSizes) {
            this.windowSizes = windowSizes;
            int n = windowSizes.length;
            this.buffers = new double[n][];
            this.heads   = new int[n];
            this.counts  = new int[n];
            this.sums    = new double[n];
            for (int i = 0; i < n; i++) buffers[i] = new double[windowSizes[i]];
        }

        void addPrice(double price) {
            for (int i = 0; i < windowSizes.length; i++) {
                if (counts[i] == windowSizes[i]) sums[i] -= buffers[i][heads[i]];
                buffers[i][heads[i]] = price;
                sums[i] += price;
                heads[i] = (heads[i] + 1) % windowSizes[i];
                counts[i] = Math.min(counts[i] + 1, windowSizes[i]);
            }
        }

        double getMA(int index) {
            return counts[index] == 0 ? 0 : sums[index] / counts[index];
        }

        void printAll(double currentPrice) {
            System.out.printf("Price: %6.2f", currentPrice);
            for (int i = 0; i < windowSizes.length; i++) {
                System.out.printf("  MA%d: %6.2f", windowSizes[i], getMA(i));
            }
            System.out.println();
        }

        // Golden cross signal: short MA crosses above long MA
        boolean isGoldenCross(int shortIdx, int longIdx) {
            return getMA(shortIdx) > getMA(longIdx);
        }
    }

    public static void main(String[] args) {
        System.out.println("=== Live Stock Moving Average System ===");
        // MA5, MA10, MA20 (typical trading indicators)
        MultiWindowMA ma = new MultiWindowMA(5, 10, 20);

        double[] prices = {
            100, 102, 101, 105, 107, 110, 108, 112, 115, 113,
            118, 120, 117, 122, 125, 128, 124, 130, 132, 129
        };

        for (double price : prices) {
            ma.addPrice(price);
            ma.printAll(price);
        }

        System.out.println("\nGolden Cross (MA5 > MA20): " + ma.isGoldenCross(0, 2));
    }
}
```

---

## ADV10. Real-Time Fraud Detection Window

**Pattern:** Multiple sliding windows at different granularities for anomaly detection

```java
import java.util.*;
import java.time.*;

public class FraudDetectionWindow {
    record Transaction(String userId, double amount, String merchant, Instant time) {}

    static class UserRiskProfile {
        private final Deque<Transaction> txns1Min  = new ArrayDeque<>();
        private final Deque<Transaction> txns1Hour = new ArrayDeque<>();
        private final Deque<Transaction> txns1Day  = new ArrayDeque<>();
        private double sum1Min = 0, sum1Hour = 0, sum1Day = 0;
        private int count1Min = 0, count1Hour = 0, count1Day = 0;

        void addTransaction(Transaction t) {
            Instant now = t.time();

            // 1-minute window
            evict(txns1Min, now, 60, sum1Min, count1Min);
            txns1Min.addLast(t); sum1Min += t.amount(); count1Min++;

            // 1-hour window
            evict(txns1Hour, now, 3600, sum1Hour, count1Hour);
            txns1Hour.addLast(t); sum1Hour += t.amount(); count1Hour++;

            // 1-day window
            evict(txns1Day, now, 86400, sum1Day, count1Day);
            txns1Day.addLast(t); sum1Day += t.amount(); count1Day++;
        }

        private void evict(Deque<Transaction> dq, Instant now, long windowSecs,
                           double sum, int count) {
            Instant cutoff = now.minusSeconds(windowSecs);
            while (!dq.isEmpty() && dq.peekFirst().time().isBefore(cutoff)) {
                Transaction old = dq.pollFirst();
                sum -= old.amount(); count--;
            }
        }

        List<String> evaluateRisk() {
            List<String> risks = new ArrayList<>();
            if (sum1Min > 10_000)   risks.add("HIGH_VELOCITY_1MIN: $" + sum1Min);
            if (count1Min > 10)     risks.add("FREQ_LIMIT_1MIN: " + count1Min + " txns");
            if (sum1Hour > 50_000)  risks.add("HIGH_AMOUNT_1HOUR: $" + sum1Hour);
            if (count1Hour > 50)    risks.add("FREQ_LIMIT_1HOUR: " + count1Hour + " txns");
            if (sum1Day > 100_000)  risks.add("DAILY_LIMIT: $" + sum1Day);
            return risks;
        }

        void printStatus() {
            System.out.printf("  1min: %d txns $%.0f | 1hr: %d txns $%.0f | 1day: %d txns $%.0f%n",
                count1Min, sum1Min, count1Hour, sum1Hour, count1Day, sum1Day);
        }
    }

    public static void main(String[] args) {
        System.out.println("=== Real-Time Fraud Detection ===");
        UserRiskProfile profile = new UserRiskProfile();
        String userId = "user-123";

        Instant base = Instant.now();
        double[] amounts = {500, 1500, 3000, 2000, 4000, 500, 800, 1200, 600, 900, 15000};
        String[] merchants = {"Amazon","Apple","Visa","Delta","Walmart","Target",
                              "BestBuy","Costco","Shell","Gas","Wire-Transfer"};

        for (int i = 0; i < amounts.length; i++) {
            Transaction t = new Transaction(userId, amounts[i], merchants[i],
                                            base.plusSeconds(i * 3));
            profile.addTransaction(t);
            List<String> risks = profile.evaluateRisk();
            System.out.printf("Txn %d: $%.0f @ %s%n", i+1, amounts[i], merchants[i]);
            profile.printStatus();
            if (!risks.isEmpty()) {
                System.out.println("  ⚠️  FRAUD ALERTS: " + risks);
            }
        }
    }
}
```

---

# Summary: Pattern Recognition Guide

```
PROBLEM SAYS...                    → USE THIS PATTERN
─────────────────────────────────────────────────────────────────
"size K subarray" + aggregate     → Fixed Window
"longest subarray where..."       → Variable Expand (left shrinks when invalid)
"shortest subarray where..."      → Variable Contract (left shrinks when valid)
"exactly K distinct" / "exactly K"→ atMost(K) - atMost(K-1)
"max/min in every window"         → Monotonic Deque
"contains duplicate within K"     → Fixed Window + HashSet
"anagram / permutation"           → Fixed Window + Frequency Array
"all characters of t"             → Variable Window + formed counter
"at most K zeros/replacements"    → Variable Window + count of violations
"sum >= target"                   → Variable Contract (min length)
"product < K"                     → Variable Contract + count += (right-left+1)
"sorted + sliding window"         → Sort first, then fixed/variable window
"circular array"                  → Double the array (size 2n)
"median in window"                → Two Heaps (max-heap + min-heap)
"stream/real-time"                → Deque or TreeMap + timestamp eviction
```

---

## Complexity Reference Table

| Problem | Time | Space | Pattern |
|---------|------|-------|---------|
| Max Sum K | O(n) | O(1) | Fixed |
| Distinct in Window | O(n) | O(k) | Fixed + HashMap |
| Max in Window | O(n) | O(k) | Deque |
| Longest No-Repeat | O(n) | O(1) | Variable + Map |
| Min Window Substring | O(n+m) | O(n+m) | Variable |
| Anagram Count | O(n) | O(1) | Fixed + Array |
| Subarray Sum = K | O(n) | O(1) | atMost trick |
| K Different | O(n) | O(k) | atMost trick |
| Sliding Median | O(n log k) | O(k) | Two Heaps |
| Shortest Sum ≥ K (neg) | O(n) | O(n) | Prefix + Deque |

---

*Happy coding! Master these 6 templates and you can solve 95% of sliding window problems.*
