class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:
        # init an answer array with 1s in them

        # use 2 for loops for a left to right pass and a right to left pass, with accumulators = 1 above both

        # the trick is that the first pass youre accumulating and setting the answer 1 position shifted to the right, on the second pass, youre mutating the answer array directly, not placing values of the acc into the answer arr

        # also the start, stop, step is -1,0,-1
        # because the 0 is not including

        answer = [1] * len(nums)

        # left pass
        acc = 1
        for i in range(len(nums)-1):
            acc *= nums[i]
            answer[i+1] = acc

        print(answer)

        # right pass
        acc = 1
        for i in range(len(nums)-1, 0, -1):
            acc *= nums[i]
            answer[i-1] *= acc

        return answer
