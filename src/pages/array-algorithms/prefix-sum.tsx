"use client";

import type React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Calculator,
  ChevronLeft,
  ChevronRight,
  Code,
} from "lucide-react";
import { Button } from "../../components/ui/button";

interface ArrayElement {
  value: number;
  isHighlighted: boolean;
  isPrefixSum: boolean;
  isRange: boolean;
}

interface Step {
  array: ArrayElement[];
  prefixSum: number[];
  description: string;
  code: string;
  rangeSumVisualization?: {
    start: number;
    end: number;
    startValue: number;
    endValue: number;
    result: number;
  };
}

function PrefixSumPage() {
  const [arrayInput, setArrayInput] = useState<string>("");
  const [rangeInput, setRangeInput] = useState<string>("");
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isVisualizing, setIsVisualizing] = useState<boolean>(false);
  const [showFullCode, setShowFullCode] = useState<boolean>(false);

  const [operation, setOperation] = useState<"prefix" | "range">("prefix");

  const resetVisualization = () => {
    setSteps([]);
    setCurrentStep(0);
    setIsVisualizing(false);
    setShowFullCode(false);
  };

  const generatePrefixSumSteps = (array: number[]) => {
    const newSteps: Step[] = [];
    const prefixSum: number[] = new Array(array.length + 1).fill(0);

    // Initial state
    newSteps.push({
      array: array.map((num) => ({
        value: num,
        isHighlighted: false,
        isPrefixSum: false,
        isRange: false,
      })),
      prefixSum: [0],
      description: "Initialize prefix sum array with 0",
      code: `# Initialize prefix sum array
prefix_sum = [0] * (len(array) + 1)`,
    });

    // Calculate prefix sum
    for (let i = 0; i < array.length; i++) {
      prefixSum[i + 1] = prefixSum[i] + array[i];

      const currentArray = array.map((num, idx) => ({
        value: num,
        isHighlighted: idx <= i,
        isPrefixSum: idx === i,
        isRange: false,
      }));

      newSteps.push({
        array: currentArray,
        prefixSum: [...prefixSum],
        description: `Calculate prefix sum at index ${i}: ${prefixSum[i + 1]}`,
        code: `# Calculate prefix sum
prefix_sum[i + 1] = prefix_sum[i] + array[i]`,
      });
    }

    return newSteps;
  };

    const generateRangeSumSteps = (array: number[], range: string) => {
    const [start, end] = range.split(",").map((num) => parseInt(num.trim()));
    if (
      isNaN(start) ||
      isNaN(end) ||
      start < 0 ||
      end >= array.length ||
      start > end
    ) {
      throw new Error("Invalid range");
    }

    const newSteps: Step[] = [];
    const prefixSum: number[] = new Array(array.length + 1).fill(0);

    // Initial state before calculating prefix sum
    newSteps.push({
      array: array.map((num) => ({
        value: num,
        isHighlighted: false,
        isPrefixSum: false,
        isRange: false,
      })),
      prefixSum: [0],
      description: "Initialize prefix sum array with 0",
      code: `# Initialize prefix sum array
prefix_sum = [0] * (len(array) + 1)`,
      rangeSumVisualization: {
        start: start,
        end: end,
        startValue: 0,
        endValue: 0,
        result: 0
      }
    });

    // Calculate prefix sum with visualization steps
    for (let i = 0; i < array.length; i++) {
      prefixSum[i + 1] = prefixSum[i] + array[i];

      const currentArray = array.map((num, idx) => ({
        value: num,
        isHighlighted: idx <= i,
        isPrefixSum: idx === i,
        isRange: false,
      }));

      newSteps.push({
        array: currentArray,
        prefixSum: [...prefixSum],
        description: `Calculate prefix sum at index ${i + 1}: ${prefixSum[i + 1]}`,
        code: `# Calculate prefix sum at index ${i + 1}
prefix_sum[${i + 1}] = prefix_sum[${i}] + array[${i}]
# ${prefixSum[i]} + ${array[i]} = ${prefixSum[i + 1]}`,
        rangeSumVisualization: {
          start: start,
          end: end,
          startValue: prefixSum[start],
          endValue: i >= end ? prefixSum[end + 1] : 0,
          result: i >= end ? prefixSum[end + 1] - prefixSum[start] : 0
        }
      });
    }

    // Highlight the range selection
    newSteps.push({
      array: array.map((num, idx) => ({
        value: num,
        isHighlighted: idx >= start && idx <= end,
        isPrefixSum: false,
        isRange: true,
      })),
      prefixSum: [...prefixSum],
      description: `Selected range from index ${start} to ${end}`,
      code: `# Selected range [${start}, ${end}]
# Will calculate sum of elements from index ${start} to ${end}`,
      rangeSumVisualization: {
        start: start,
        end: end,
        startValue: prefixSum[start],
        endValue: prefixSum[end + 1],
        result: prefixSum[end + 1] - prefixSum[start]
      }
    });

    // Show range sum calculation
    const rangeSum = prefixSum[end + 1] - prefixSum[start];
    const currentArray = array.map((num, idx) => ({
      value: num,
      isHighlighted: idx >= start && idx <= end,
      isPrefixSum: false,
      isRange: true,
    }));

    newSteps.push({
      array: currentArray,
      prefixSum: [...prefixSum],
      description: `Calculate range sum using prefix sum array:
      Range sum = prefix_sum[${end + 1}] - prefix_sum[${start}]
      = ${prefixSum[end + 1]} - ${prefixSum[start]} = ${rangeSum}`,
      code: `# Calculate range sum
range_sum = prefix_sum[${end + 1}] - prefix_sum[${start}]
# ${prefixSum[end + 1]} - ${prefixSum[start]} = ${rangeSum}`,
      rangeSumVisualization: {
        start: start,
        end: end,
        startValue: prefixSum[start],
        endValue: prefixSum[end + 1],
        result: rangeSum
      }
    });    return newSteps;
  };

  const handleVisualize = () => {
    try {
      const numbers = arrayInput.split(",").map((num) => parseInt(num.trim()));
      if (numbers.some(isNaN)) {
        throw new Error("Invalid number in array");
      }

      resetVisualization();
      setIsVisualizing(true);
      const newSteps =
        operation === "prefix"
          ? generatePrefixSumSteps(numbers)
          : generateRangeSumSteps(numbers, rangeInput);
      setSteps(newSteps);
      setIsVisualizing(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Please enter valid input");
    }
  };

  const getFullCode = () => {
    if (operation === "prefix") {
      return `def calculate_prefix_sum(array):
    # Initialize prefix sum array
    prefix_sum = [0] * (len(array) + 1)
    
    # Calculate prefix sum
    for i in range(len(array)):
        prefix_sum[i + 1] = prefix_sum[i] + array[i]
    
    return prefix_sum`;
    } else {
      return `def range_sum_query(array, start, end):
    # Calculate prefix sum array
    prefix_sum = [0] * (len(array) + 1)
    for i in range(len(array)):
        prefix_sum[i + 1] = prefix_sum[i] + array[i]
    
    # Calculate range sum
    return prefix_sum[end + 1] - prefix_sum[start]`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b dark:border-slate-700">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link
                to="/array-algorithms"
                className="p-2 hover:bg-gray-100 dark:bg-slate-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </Link>
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Prefix Sum
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Input Section */}
        <div className="mb-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Input
          </h2>
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <button
                onClick={() => setOperation("prefix")}
                className={`flex-1 px-4 py-2 rounded-lg ${
                  operation === "prefix"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                }`}
              >
                Prefix Sum
              </button>
              <button
                onClick={() => setOperation("range")}
                className={`flex-1 px-4 py-2 rounded-lg ${
                  operation === "range"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                }`}
              >
                Range Sum
              </button>
            </div>
            <div>
              <label
                htmlFor="array-input"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Array (comma-separated numbers)
              </label>
              <input
                id="array-input"
                type="text"
                value={arrayInput}
                onChange={(e) => setArrayInput(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-2 focus:ring-purple-500 dark:text-white"
                placeholder="e.g., 1, 2, 3, 4, 5"
              />
            </div>
            {operation === "range" && (
              <div>
                <label
                  htmlFor="range-input"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Range (start,end)
                </label>
                <input
                  id="range-input"
                  type="text"
                  value={rangeInput}
                  onChange={(e) => setRangeInput(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-2 focus:ring-purple-500 dark:text-white"
                  placeholder="e.g., 1,3"
                />
              </div>
            )}
            <button
              onClick={handleVisualize}
              disabled={isVisualizing}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              Visualize
            </button>
          </div>
        </div>

        {steps.length > 0 && (
          <>
            {/* Step Navigation */}
            <div className="mb-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Step {currentStep + 1} of {steps.length}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setCurrentStep((prev) => Math.max(0, prev - 1))
                    }
                    disabled={currentStep === 0}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentStep((prev) =>
                        Math.min(steps.length - 1, prev + 1)
                      )
                    }
                    disabled={currentStep === steps.length - 1}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 disabled:opacity-50"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {steps[currentStep].description}
              </p>
              <Button onClick={() => setCurrentStep(0)} variant="secondary">
                Reset
              </Button>
            </div>

            {/* Array Visualization */}
            <div className="mb-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Array Visualization
              </h2>
              <div className="flex flex-wrap gap-4 justify-center">
                {steps[currentStep].array.map((element, index) => (
                  <div
                    key={index}
                    className={`w-16 h-16 flex items-center justify-center rounded-lg text-lg font-bold transition-all duration-300 ${
                      element.isRange
                        ? "bg-pink-500 text-white"
                        : element.isPrefixSum
                        ? "bg-purple-500 text-white"
                        : element.isHighlighted
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {element.value}
                  </div>
                ))}
              </div>
            </div>

            {/* Prefix Sum Array */}
            <div className="mb-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Prefix Sum Array
              </h2>
              <div className="flex flex-wrap gap-4 justify-center">
                {steps[currentStep].prefixSum.map((sum, index) => (
                  <div
                    key={index}
                    className="w-16 h-16 flex items-center justify-center rounded-lg text-lg font-bold bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300"
                  >
                    {sum}
                  </div>
                ))}
              </div>
            </div>

            {/* Range Sum Visualization */}
            {operation === "range" && steps[currentStep]?.rangeSumVisualization && (
              <div className="mb-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Range Sum Calculation
                </h2>
                <div className="flex flex-col items-center space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700 dark:text-gray-300">Prefix Sum[end + 1]:</span>
                      <div className="w-16 h-16 flex items-center justify-center rounded-lg text-lg font-bold bg-pink-500 text-white">
                        {steps[currentStep]?.rangeSumVisualization?.endValue ?? 0}
                      </div>
                    </div>
                    <span className="text-2xl text-gray-700 dark:text-gray-300">-</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700 dark:text-gray-300">Prefix Sum[start]:</span>
                      <div className="w-16 h-16 flex items-center justify-center rounded-lg text-lg font-bold bg-purple-500 text-white">
                        {steps[currentStep]?.rangeSumVisualization?.startValue ?? 0}
                      </div>
                    </div>
                    <span className="text-2xl text-gray-700 dark:text-gray-300">=</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700 dark:text-gray-300">Range Sum:</span>
                      <div className="w-16 h-16 flex items-center justify-center rounded-lg text-lg font-bold bg-green-500 text-white">
                        {steps[currentStep]?.rangeSumVisualization?.result ?? 0}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-center mt-4">
                    Range sum from index {steps[currentStep]?.rangeSumVisualization?.start ?? 0} to {steps[currentStep]?.rangeSumVisualization?.end ?? 0} is calculated by subtracting the prefix sum at start index from the prefix sum at end+1 index
                  </p>
                </div>
              </div>
            )}

            {/* Code Display */}
            <div className="mb-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Code
                </h2>
                <button
                  onClick={() => setShowFullCode(!showFullCode)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200"
                >
                  <Code className="w-5 h-5" />
                  {showFullCode ? "Show Step Code" : "Show Full Code"}
                </button>
              </div>
              <pre className="bg-gray-50 dark:bg-slate-900 p-4 rounded-lg overflow-x-auto">
                <code className="text-sm text-gray-800 dark:text-gray-100">
                  {showFullCode ? getFullCode() : steps[currentStep].code}
                </code>
              </pre>
            </div>
          </>
        )}

        {/* Practice Questions */}
        <div className="mt-6 border-t pt-4">
          <h4 className="text-xl font-bold text-black dark:text-gray-200 mb-3">
            Practice Questions
          </h4>
          <div className="space-y-2"></div>
          <>
            <>
              <a
                href="https://leetcode.com/problems/range-sum-query-immutable/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-lg text-blue-600 dark:text-blue-400 hover:underline"
              >
                • LeetCode: Range Sum Query
              </a>
              <a
                href="https://practice.geeksforgeeks.org/problems/prefix-sum-array/1"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-lg text-blue-600 dark:text-blue-400 hover:underline"
              >
                • GFG: Prefix Sum Array
              </a>
            </>
          </>
        </div>
      </main>
    </div>
  );
}

export default PrefixSumPage;
export {};
