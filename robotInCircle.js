var judgeCircle = function(moves) {
    var v = 0,
        h = 0;

    var move = moves.split("");
    for (var i = 0; i < move.length; i++) {
        switch (move[i]) {
            case "U":
                v++;
                break;
            case "D":
                v--;
                break;
            case "R":
                h++;
                break;
            case "L":
                h--;
                break;
        }
    }

    return v == 0 && h == 0;
};

console.log(judgeCircle("UD"));

function TreeNode(val) {
    this.val = val;
    this.left = this.right = null;
}

var mergeTrees = function mergeTrees(t1, t2) {
    if (t1 == null && t2 == null) return null;

    var val = (t1 == null) ? 0 : t1.val + (t2 == null) ? 0 : t2.val;
    var newNode = new TreeNode(val);

    newNode.left = mergeTrees(t1 == null ? null : t1.left, t2 == null ? null : t2.left);
    newNode.right = mergeTrees(t1 == null ? null : t1.right, t2 == null ? null : t2.right);

    return newNode;
};

var findWords = function(words) {
    var regex = /^[qwertyuiop]+$|^[asdfghjkl]+$|^[zxcvbnm]+$/i;
    return words.filter(function(word) {
        return word.match(regex);
    });
};

var ws = ["Hello", "Alaska", "Dad", "Peace"];
console.log(findWords(ws));

// Reverse string
var reverseWords = function(s) {
    var strArray = s.split(" ");
    var reversedArray = strArray.map(function(str) {
        return str.split("").reverse().join("");
    });

    return reversedArray.join(" ");
};