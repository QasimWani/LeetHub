class Solution(object):
    def isPalindrome(self, x):
        """
        :type x: int
        :rtype: bool
        """
        l = []
        l2 = []
        for i in str(x): 
            l.append(i)

        for j in reversed(str(x)):
            l2.append(j)
        
        return l == l2

