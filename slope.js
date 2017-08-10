/*
 Detecting whether a point is above or below a slope
 (aX,aY) -  One end of slope coordinate
 (bX,bY) -  Other end of slope coordinate
 (tx. tY) - Test point

 Return value
  1 - Above
 -1 - Below
  0 - On the line 
*/
function getPointPosition(aX, aY, bX, bY, tX, tY) {
    var gradient = function getGradient(x1, y1, x2, y2) {
        return (x2 - x1) == 0 ? 0 : ((y2 - y1) / (x2 - x1));
    }(aX, aY, bX, bY);

    var yIntercept = aY - gradient;
    var yRight = (gradient * tX) + yIntercept;

    if (tY > yRight) { return 1; } else if (tY < yRight) { return -1; } else { return 0; }
}

// Test Here
console.log(getPointPosition(2, 1, 7, 8, 3, -4));