http://norvig.com/ngrams/

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

