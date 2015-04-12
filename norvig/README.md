Natural Language Corpus data from http://norvig.com/ngrams/ which says:

> Data files are derived from the Google Web Trillion Word Corpus, as
> [ described ](http://googleresearch.blogspot.com/2006/08/all-our-n-gram-are-belong-to-you.html)
> by Thorsten Brants and Alex Franz, and [ distributed ](http://tinyurl.com/ngrams) 
> y the Linguistic Data Consortium.  Code copyright (c) 2008-2009 by Peter Norvig.
> You are free to use this code under the MIT license.

```
curl -O http://norvig.com/ngrams/count_1w.txt
cat count_1w.txt | tr '\t' ' ' | sed -e 's/ .*//' | sed -e 's/./& /g' | head -1000 > spacey_1000.txt

1. `cat` it, where each line is word, tab, frequency
2. Convert tabs to spaces 
3. Remove the space and everything after it
4. Insert spaces between each character
5. Take top 1000 words
6. Save to spacey_1000.txt
```

